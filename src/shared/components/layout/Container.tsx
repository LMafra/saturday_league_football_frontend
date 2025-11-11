import { CSSProperties, PropsWithChildren } from "react";
import { layout } from "@/shared/styles/tokens";

const containerStyle: CSSProperties = {
  maxWidth: layout.maxWidth,
  paddingInline: layout.gutter,
  marginInline: "auto",
  width: "100%",
};

const Container = ({ children }: PropsWithChildren) => (
  <div style={containerStyle}>{children}</div>
);

export default Container;

