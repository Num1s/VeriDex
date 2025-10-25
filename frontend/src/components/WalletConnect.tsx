'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { formatAddress } from '../utils/formatters';
import { useWalletAuth } from '../hooks/useWalletAuth';

interface WalletConnectProps {
  showBalance?: boolean;
  variant?: 'default' | 'compact';
}

export default function WalletConnect({ showBalance = false, variant = 'default' }: WalletConnectProps) {
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated, nonce, generateNonce, login, signAuthMessage, isAuthenticating } = useWalletAuth();

  const handleAuth = async () => {
    console.log('🔐 handleAuth called', { address, isConnected });
    
    if (!address) {
      console.error('❌ No address available');
      return;
    }

    try {
      console.log('📝 Generating nonce...');
      // Generate nonce if not already generated
      let currentNonce = nonce;
      if (!currentNonce) {
        currentNonce = await generateNonce() || '';
        console.log('✅ Nonce generated:', currentNonce);
      }

      // Create message to sign
      const message = `Welcome to AutoToken!\n\nPlease sign this message to authenticate with your wallet.\n\nNonce: ${currentNonce}\n\nThis signature will be used to verify your identity and will not trigger any blockchain transaction.`;

      console.log('✍️ Signing message...');
      // Sign the message
      const signature = await signAuthMessage(message);
      console.log('✅ Message signed');

      console.log('🔑 Logging in...');
      // Login with signature
      await login(signature, message);
      console.log('✅ Login successful');
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      alert(`Authentication failed: ${error?.message || 'Unknown error'}`);
    }
  };

  if (variant === 'compact') {
    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          if (!mounted) return null;

          return (
            <div className="flex items-center gap-2">
              {account && chain ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openChainModal}
                    className="flex items-center gap-1"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: chain.iconBackground }}
                    />
                    {chain.name}
                  </Button>

                  {/* Authenticate Button - when wallet connected but not authenticated */}
                  {isConnected && !isAuthenticated ? (
                    <Button
                      onClick={(e) => {
                        console.log('🔘 Sign In button clicked', { isConnected, isAuthenticated, address });
                        handleAuth();
                      }}
                      disabled={isAuthenticating}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isAuthenticating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                          Signing...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openAccountModal}
                      className="flex items-center gap-1"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {formatAddress(account.address)}
                      {showBalance && account.displayBalance && (
                        <span className="ml-1">({account.displayBalance})</span>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={openConnectModal} size="sm">
                  Connect Wallet
                </Button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          if (!mounted) return null;

          return (
            <div className="flex items-center gap-3">
              {account && chain ? (
                <>
                  {/* Network Badge */}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: chain.iconBackground }}
                    />
                    {chain.name}
                  </Badge>

                  {/* Account Button */}
                  <Button
                    variant="outline"
                    onClick={openAccountModal}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="hidden sm:inline">
                      {formatAddress(account.address)}
                    </span>
                    <span className="sm:hidden">
                      {account.displayName}
                    </span>
                    {showBalance && account.displayBalance && (
                      <span className="text-sm text-muted-foreground">
                        {account.displayBalance}
                      </span>
                    )}
                  </Button>

                  {/* Authenticate Button - when wallet connected but not authenticated */}
                  {isConnected && !isAuthenticated && (
                    <Button
                      onClick={handleAuth}
                      disabled={isAuthenticating}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isAuthenticating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  )}

                  {/* User Status */}
                  {isAuthenticated && user && (
                    <Card className="px-3 py-1">
                      <CardContent className="p-0 flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : formatAddress(user.walletAddress)
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            {user.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            {user.kycStatus === 'approved' && (
                              <Badge variant="outline" className="text-xs">
                                KYC
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Button onClick={openConnectModal} size="default">
                  Connect Wallet
                </Button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

