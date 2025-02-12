export interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (description: string, status: string) => void;
}
