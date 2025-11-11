import { useToast } from '../hooks/useToast';
import Toast from './Toast';

export default function ToastProvider() {
  const { isVisible, message, type, hideToast } = useToast();

  if (!isVisible) return null;

  return <Toast message={message} type={type} onClose={hideToast} />;
}
