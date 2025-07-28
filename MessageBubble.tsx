import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share, ThumbsUp, ThumbsDown, User, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Chat Message",
          text: message.content,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopy();
    }
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] bg-green-600 text-white rounded-2xl rounded-br-lg px-4 py-3">
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.images && message.images.length > 0 && (
            <div className={cn(
              "mt-3 grid gap-2",
              message.images.length === 1 ? "grid-cols-1" :
              message.images.length === 2 ? "grid-cols-2" :
              "grid-cols-2"
            )}>
              {message.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`صورة مرفقة ${index + 1}`}
                    className="rounded-lg w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    data-testid={`image-user-${index}`}
                    onClick={() => window.open(image, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">انقر للعرض</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs opacity-75 mt-2 text-right">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
        <Brain className="h-4 w-4 text-green-600" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-lg px-4 py-3">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap m-0">{message.content}</p>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-auto"
                onClick={handleCopy}
                data-testid="button-copy-message"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-auto"
                onClick={handleShare}
                data-testid="button-share-message"
              >
                <Share className="h-3 w-3" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-auto"
                data-testid="button-thumbs-up"
              >
                <ThumbsUp className="h-3 w-3" />
                Good
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-auto"
                data-testid="button-thumbs-down"
              >
                <ThumbsDown className="h-3 w-3" />
                Bad
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
