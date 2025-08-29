import { useState, useCallback, useRef, useEffect } from "react";

// ===== BEHAVIORAL PATTERN: Observer Pattern =====
// Observer interface for form state changes
interface FormStateObserver<T = Record<string, unknown>> {
  (state: FormState<T>): void;
}

// Form state interface
interface FormState<T = Record<string, unknown>> {
  data: T;
  error: string | null;
  isSubmitting: boolean;
  isValid: boolean;
}

// ===== BEHAVIORAL PATTERN: Strategy Pattern =====
// Strategy for form validation
interface ValidationStrategy<T> {
  validate(data: T): { isValid: boolean; errors: string[] };
}

// Default validation strategy
class DefaultValidationStrategy<T extends Record<string, unknown>> implements ValidationStrategy<T> {
  validate(data: T): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation - check for required fields
    Object.entries(data).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        errors.push(`${key} is required`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }
}

// ===== BEHAVIORAL PATTERN: Template Method Pattern =====
// Base form handler with common functionality
abstract class BaseFormHandler<T extends Record<string, unknown>> {
  protected observers: FormStateObserver[] = [];
  protected validationStrategy: ValidationStrategy<T>;

  constructor(validationStrategy?: ValidationStrategy<T>) {
    this.validationStrategy = validationStrategy || new DefaultValidationStrategy<T>();
  }

  // Template method for form submission
  protected async executeSubmit(
    data: T,
    callback: (data: T) => Promise<void>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate data
      const validation = this.validationStrategy.validate(data);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Execute callback
      await callback(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      };
    }
  }

  // Observer pattern methods
  addObserver(observer: FormStateObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: FormStateObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  protected notifyObservers(state: FormState<T>): void {
    this.observers.forEach(observer => observer(state));
  }
}

// ===== CONCRETE FORM HANDLER =====
class ModalFormHandler<T extends Record<string, unknown>> extends BaseFormHandler<T> {
  private state: FormState<T>;

  constructor(initialState: T, validationStrategy?: ValidationStrategy<T>) {
    super(validationStrategy);
    this.state = {
      data: initialState,
      error: null,
      isSubmitting: false,
      isValid: true
    };
  }

  updateState(updates: Partial<FormState<T>>): void {
    this.state = { ...this.state, ...updates };
    this.notifyObservers(this.state);
  }

  async handleSubmit(
    callback: (data: T) => Promise<void>
  ): Promise<void> {
    this.updateState({ isSubmitting: true, error: null });

    const result = await this.executeSubmit(this.state.data, callback);

    this.updateState({
      isSubmitting: false,
      error: result.error || null
    });
  }

  handleChange(name: string, value: unknown): void {
    const newData = { ...this.state.data, [name]: value };
    const validation = this.validationStrategy.validate(newData);

    this.updateState({
      data: newData,
      error: null,
      isValid: validation.isValid
    });
  }

  resetForm(initialState: T): void {
    this.updateState({
      data: initialState,
      error: null,
      isSubmitting: false,
      isValid: true
    });
  }

  getState(): FormState<T> {
    return this.state;
  }
}

// ===== HOOK IMPLEMENTATION =====
export const useModalForm = <T extends Record<string, unknown>>(
  initialState: T,
  validationStrategy?: ValidationStrategy<T>
) => {
  const formHandlerRef = useRef<ModalFormHandler<T>>();

  if (!formHandlerRef.current) {
    formHandlerRef.current = new ModalFormHandler(initialState, validationStrategy);
  }

  const [state, setState] = useState<FormState<T>>(formHandlerRef.current.getState());

  // Observer implementation
  const observer: FormStateObserver<Record<string, unknown>> = useCallback((newState: FormState<Record<string, unknown>>) => {
    setState(newState as FormState<T>);
  }, [setState]);

  // Add observer on mount
  useEffect(() => {
    formHandlerRef.current!.addObserver(observer);
    return () => formHandlerRef.current!.removeObserver(observer);
  }, [observer]);

  const handleChange = useCallback((
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    formHandlerRef.current!.handleChange(name, value);
  }, []);

  const handleSubmit = useCallback(async (
    callback: (data: T) => Promise<void>,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    await formHandlerRef.current!.handleSubmit(callback);
  }, []);

  const resetForm = useCallback(() => {
    formHandlerRef.current!.resetForm(initialState);
  }, [initialState]);

  const setFormData = useCallback((data: T) => {
    formHandlerRef.current!.updateState({ data });
  }, []);

  return {
    formData: state.data,
    setFormData,
    error: state.error,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
