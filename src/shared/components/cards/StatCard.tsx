import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface StatCardProps extends PropsWithChildren {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accentColorClassName: string;
}

const StatCard = ({ title, value, icon, accentColorClassName }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    className={`flex items-center justify-between rounded-xl border-l-4 bg-white p-4 shadow-md ${accentColorClassName}`}
  >
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    <div className="text-2xl text-gray-700">{icon}</div>
  </motion.div>
);

export default StatCard;

