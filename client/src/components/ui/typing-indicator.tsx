import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3" data-testid="typing-indicator">
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white flex-shrink-0">
        <i className="fas fa-robot text-sm"></i>
      </div>
      <div className="bg-muted p-4 rounded-2xl rounded-tl-md">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-muted-foreground rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
