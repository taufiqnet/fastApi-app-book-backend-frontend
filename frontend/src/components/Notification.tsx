import { useEffect } from "react";

interface NotificationProps {
  message: string;
  onClose: () => void;
  type: "success" | "error";
}

export default function Notification({ message, onClose, type }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const backgroundColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white ${backgroundColor}`}>
      <p>{message}</p>
      <button onClick={onClose} className="absolute top-2 right-2 text-white">
        &times;
      </button>
    </div>
  );
}
