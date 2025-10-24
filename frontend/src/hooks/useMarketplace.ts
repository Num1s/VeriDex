import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress, getContractABI } from '../config/contracts';
import { useToast } from './useToast';

export const useMarketplace = () => {
  const { toast } = useToast();

  // Create listing
  const { writeContract: createListing, data: listingHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast({
          title: 'Listing Created',
          description: 'Car listing transaction submitted successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Listing Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const { isLoading: isCreatingListing } = useWaitForTransactionReceipt({
    hash: listingHash,
  });

  // Purchase listing
  const { writeContract: purchaseListing, data: purchaseHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast({
          title: 'Purchase Submitted',
          description: 'Car purchase transaction submitted successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Purchase Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const { isLoading: isPurchasing } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  // Get listing details
  const { data: listingDetails, refetch: refetchListing } = useReadContract({
    address: getContractAddress('marketplace', 31337),
    abi: getContractABI('marketplace'),
    functionName: 'getListing',
    args: [], // Will be set when called
  });

  // Get active listings
  const { data: activeListings, refetch: refetchActiveListings } = useReadContract({
    address: getContractAddress('marketplace', 31337),
    abi: getContractABI('marketplace'),
    functionName: 'getActiveListings',
    args: [],
  });

  const handleCreateListing = async (tokenId: bigint, price: bigint) => {
    try {
      await createListing({
        address: getContractAddress('marketplace', 31337),
        abi: getContractABI('marketplace'),
        functionName: 'createListing',
        args: [tokenId, price],
      });
    } catch (error) {
      throw error;
    }
  };

  const handlePurchaseListing = async (listingId: bigint, value: bigint) => {
    try {
      await purchaseListing({
        address: getContractAddress('marketplace', 31337),
        abi: getContractABI('marketplace'),
        functionName: 'purchaseListing',
        args: [listingId],
        value,
      });
    } catch (error) {
      throw error;
    }
  };

  const handlePurchaseWithEscrow = async (listingId: bigint, value: bigint) => {
    try {
      await purchaseListing({
        address: getContractAddress('marketplace', 31337),
        abi: getContractABI('marketplace'),
        functionName: 'purchaseWithEscrow',
        args: [listingId],
        value,
      });
    } catch (error) {
      throw error;
    }
  };

  const getListing = async (listingId: bigint) => {
    try {
      const listing = await refetchListing({
        address: getContractAddress('marketplace', 31337),
        abi: getContractABI('marketplace'),
        functionName: 'getListing',
        args: [listingId],
      });
      return listing.data;
    } catch (error) {
      throw error;
    }
  };

  const getActiveListings = async () => {
    try {
      const listings = await refetchActiveListings({
        address: getContractAddress('marketplace', 31337),
        abi: getContractABI('marketplace'),
        functionName: 'getActiveListings',
        args: [],
      });
      return listings.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    // State
    listingDetails,
    activeListings,
    isCreatingListing,
    isPurchasing,

    // Actions
    handleCreateListing,
    handlePurchaseListing,
    handlePurchaseWithEscrow,
    getListing,
    getActiveListings,
  };
};

