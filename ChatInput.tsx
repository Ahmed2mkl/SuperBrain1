import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, 
  Mic, 
  Send, 
  X, 
  Image as ImageIcon,
  Code,
  PenTool,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  conversationId?: string;
  onMessageSent?: () => void;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatInput({ conversationId, onMessageSent, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, files }: {
      conversationId: string;
      content: string;
      files: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', content);
      
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send message');
      }

      return response.json();
    },
    onMutate: () => {
      onTyping?.(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversationId, "messages"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations"] 
      });
      onMessageSent?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      onTyping?.(false);
    },
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!conversationId) {
      toast({
        title: "No conversation selected",
        description: "Please create a new chat or select an existing one.",
        variant: "destructive",
      });
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) {
      return;
    }

    sendMessageMutation.mutate({
      conversationId,
      content: trimmedMessage,
      files: selectedFiles,
    });

    setMessage("");
    setSelectedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') ||
                         file.type.startsWith('audio/') ||
                         file.type === 'application/pdf' ||
                         file.type.includes('document') ||
                         file.type === 'text/plain';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: `${file.name} نوع ملف غير مدعوم.`,
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "الملف كبير جداً",
          description: `${file.name} أكبر من 10 ميجابايت.`,
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const insertQuickAction = (action: string) => {
    setMessage(action);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                  data-testid={`file-preview-${index}`}
                >
                  {file.type.startsWith('image/') ? (
                    <div className="aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* File Info Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-end">
                    <div className="p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-medium truncate">{file.name}</p>
                      <p>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {selectedFiles.length} ملف محدد • سيتم حفظ الصور مع الرسالة
            </p>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit}>
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسألني أي شيء... يمكنني الكتابة الإبداعية، مساعدة في البرمجة، مناقشة المواضيع الحساسة، وأكثر بكثير!"
              className="w-full bg-transparent border-0 resize-none focus:ring-0 focus-visible:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 p-4 pr-20 min-h-[60px] max-h-[200px]"
              rows={1}
              data-testid="input-message"
            />
            
            {/* Input Controls */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              {/* File Upload */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-file-upload"
              >
                <Paperclip className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </Button>

              {/* Voice Input */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                data-testid="button-voice-input"
              >
                <Mic className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                disabled={sendMessageMutation.isPending || (!message.trim() && selectedFiles.length === 0)}
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileSelect}
              data-testid="input-file-hidden"
            />
          </div>
        </form>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3 text-xs flex-wrap">
          <span className="text-gray-500 dark:text-gray-400">إجراءات سريعة:</span>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => insertQuickAction("اكتب لي وصفاً تفصيلياً لما أريد تحليله:")}
            data-testid="button-quick-analyze"
          >
            <ImageIcon className="h-3 w-3 mr-1" />
            تحليل الصور
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => insertQuickAction("ساعدني في إصلاح هذا الكود:")}
            data-testid="button-quick-debug"
          >
            <Code className="h-3 w-3 mr-1" />
            إصلاح الكود
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => insertQuickAction("ساعدني في كتابة قصة إبداعية عن:")}
            data-testid="button-quick-creative"
          >
            <PenTool className="h-3 w-3 mr-1" />
            الكتابة الإبداعية
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => insertQuickAction("قدم تحليلاً عميقاً ومفصلاً لـ:")}
            data-testid="button-quick-analysis"
          >
            <Brain className="h-3 w-3 mr-1" />
            تحليل عميق
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="status-indicator"></div>
              <span>GROQ Llama نشط</span>
            </span>
            <span>وضع بدون قيود</span>
            <span>سرعة فائقة</span>
          </div>
          <span>جاهز للمساعدة</span>
        </div>
      </div>
    </div>
  );
}
