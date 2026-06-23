export interface SelectProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  action?: () => void | Promise<void>;
  isActive?: boolean;
  className?: string;
}

export interface ItemSelectProps {
  label?: string;
  items: SelectProps[];
}

export interface SelectPropsHeader {
  name?: string;
  email?: string;
}
