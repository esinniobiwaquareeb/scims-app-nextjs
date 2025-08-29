import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Copy, Check, Key } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onResetPassword: (newPassword: string) => Promise<void>;
  title?: string;
  description?: string;
  buttonText?: string;
}

export const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  isOpen,
  onClose,
  userName,
  onResetPassword,
  title = "Reset User Password",
  description,
  buttonText = "Reset Password"
}) => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const generateNewPassword = useCallback(() => {
    // Generate a secure random password
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
  }, []);

  const copyPasswordToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopiedPassword(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
      toast.error('Failed to copy password');
    }
  }, [newPassword]);

  const resetPassword = useCallback(async () => {
    if (!newPassword) {
      toast.error('Please enter or generate a new password first');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsResettingPassword(true);
    try {
      await onResetPassword(newPassword);
      setPasswordResetSuccess(true);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Error in password reset:', error);
    } finally {
      setIsResettingPassword(false);
    }
  }, [newPassword, onResetPassword]);

  const handleClose = useCallback(() => {
    onClose();
    setNewPassword('');
    setPasswordResetSuccess(false);
    setCopiedPassword(false);
  }, [onClose]);

  const displayDescription = description || `Reset password for ${userName}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {displayDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!passwordResetSuccess ? (
            <>
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password manually or click Generate"
                    className="font-mono"
                  />
                  <Button
                    onClick={generateNewPassword}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a password manually or click Generate for a secure random password (minimum 8 characters)
                </p>
                {newPassword && (
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${newPassword.length >= 8 ? 'text-green-600' : 'text-orange-600'}`}>
                      {newPassword.length} characters
                    </span>
                    <span className="text-muted-foreground">
                      {newPassword.length >= 8 ? '✓ Meets minimum length' : '⚠ Too short'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={resetPassword}
                  disabled={!newPassword || isResettingPassword}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    buttonText
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Password Reset Successful!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  The new password has been set for {userName}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="font-mono bg-gray-50"
                  />
                  <Button
                    onClick={copyPasswordToClipboard}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this password and provide it to the user securely. You can also edit it if needed.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
