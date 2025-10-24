import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { authAPI, handleApiError } from '../services/api';
import { useToast } from './useToast';

export const useWalletAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [nonce, setNonce] = useState('');

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('autotoken_token');
    if (token) {
      // Verify token and get user data
      authAPI.refreshToken(token)
        .then((response: any) => {
          // Token is valid, get user profile
          return authAPI.getProfile();
        })
        .then((response: any) => {
          setUser(response.data.data);
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('autotoken_token');
        });
    }
  }, []);

  // Auto-generate nonce when wallet is connected but user is not authenticated
  useEffect(() => {
    if (isConnected && !user && !nonce) {
      generateNonce().catch(console.error);
    }
  }, [isConnected, user, nonce]);

  const generateNonce = async () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await authAPI.generateNonce(address);
      setNonce(response.data.data.nonce);
      return response.data.data.nonce;
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const login = async (signature: string, message: string) => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsAuthenticating(true);

    try {
      const response = await authAPI.login(address, signature, message);

      // Save token
      localStorage.setItem('autotoken_token', response.data.data.token);

      // Set user data
      setUser(response.data.data.user);

      toast({
        title: 'Success',
        description: 'Successfully logged in!',
      });

      return response.data.data;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: handleApiError(error),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('autotoken_token');
      setUser(null);
      setNonce('');
      disconnect();
    }
  };

  const connectWallet = async (connectorId?: string) => {
    try {
      if (connectorId) {
        const connector = connectors.find((c: any) => c.id === connectorId);
        if (connector) {
          await connect({ connector });
        }
      } else {
        // Connect with first available connector
        if (connectors.length > 0) {
          await connect({ connector: connectors[0] });
        }
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signAuthMessage = async (message: string) => {
    try {
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (error) {
      toast({
        title: 'Signature Failed',
        description: 'Please sign the message in your wallet',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    // State
    isConnected,
    address,
    user,
    nonce,
    isAuthenticating,

    // Actions
    connectWallet,
    generateNonce,
    login,
    logout,
    signAuthMessage,

    // Utilities
    isAuthenticated: !!user,
    isAdmin: user?.kycStatus === 'approved' && user?.isVerified,
  };
};

