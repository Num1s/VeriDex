import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gaslessAPI, handleApiError } from '../services/api';
import { useToast } from './useToast';

export const useGasless = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mint car gaslessly
  const mintCarMutation = useMutation({
    mutationFn: ({ carData, images }: { carData: any; images?: File[] }) =>
      gaslessAPI.mintCar(carData, images),
    onSuccess: (data) => {
      toast({
        title: 'Gasless Mint Submitted',
        description: 'Your car minting transaction has been submitted',
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast({
        title: 'Mint Failed',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });

  // List car gaslessly
  const listCarMutation = useMutation({
    mutationFn: ({ tokenId, price }: { tokenId: string; price: string }) =>
      gaslessAPI.listCar({ tokenId, price }),
    onSuccess: (data) => {
      toast({
        title: 'Gasless Listing Submitted',
        description: 'Your car listing transaction has been submitted',
      });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['active-listings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast({
        title: 'Listing Failed',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });

  // Purchase car gaslessly
  const purchaseCarMutation = useMutation({
    mutationFn: ({ listingId, price, useEscrow }: { listingId: string; price: string; useEscrow?: boolean }) =>
      gaslessAPI.purchaseCar({ listingId, price, useEscrow }),
    onSuccess: (data) => {
      toast({
        title: 'Gasless Purchase Submitted',
        description: 'Your car purchase transaction has been submitted',
      });
      queryClient.invalidateQueries({ queryKey: ['active-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast({
        title: 'Purchase Failed',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });

  // Get user's gasless transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['gasless-transactions'],
    queryFn: () => gaslessAPI.getTransactions(),
    enabled: true,
  });

  // Get transaction status
  const getTransactionStatus = async (txHash: string) => {
    try {
      const response = await gaslessAPI.getTransactionStatus(txHash);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  // Cancel transaction
  const cancelTransactionMutation = useMutation({
    mutationFn: (txHash: string) => gaslessAPI.cancelTransaction(txHash),
    onSuccess: (data) => {
      toast({
        title: 'Transaction Cancelled',
        description: 'Your transaction has been cancelled',
      });
      queryClient.invalidateQueries({ queryKey: ['gasless-transactions'] });
    },
    onError: (error) => {
      toast({
        title: 'Cancellation Failed',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });

  // Get gasless statistics
  const { data: gaslessStats } = useQuery({
    queryKey: ['gasless-stats'],
    queryFn: () => gaslessAPI.getStats(),
    enabled: true,
  });

  // Get gas price
  const { data: gasPrice } = useQuery({
    queryKey: ['gas-price'],
    queryFn: () => gaslessAPI.getGasPrice(),
    enabled: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Estimate gas for transaction
  const estimateGasMutation = useMutation({
    mutationFn: (txData: any) => gaslessAPI.estimateGas(txData),
    onSuccess: (data) => {
      toast({
        title: 'Gas Estimated',
        description: `Estimated gas cost: ${data.data.data.gasEstimateEth} ETH`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Gas Estimation Failed',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });

  return {
    // Mint
    mintCar: mintCarMutation.mutate,
    isMinting: mintCarMutation.isPending,

    // List
    listCar: listCarMutation.mutate,
    isListing: listCarMutation.isPending,

    // Purchase
    purchaseCar: purchaseCarMutation.mutate,
    isPurchasing: purchaseCarMutation.isPending,

    // Transactions
    transactions: transactions?.data || [],
    transactionsLoading,

    // Transaction management
    getTransactionStatus,
    cancelTransaction: cancelTransactionMutation.mutate,
    isCancelling: cancelTransactionMutation.isPending,

    // Stats
    gaslessStats: gaslessStats?.data,

    // Gas
    gasPrice: gasPrice?.data,
    estimateGas: estimateGasMutation.mutate,
    isEstimatingGas: estimateGasMutation.isPending,
  };
};

