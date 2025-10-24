import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress, getContractABI } from '../config/contracts';
import { useToast } from './useToast';

export const useCarContract = () => {
  const { toast } = useToast();

  // Mint car NFT
  const { writeContract: mintCar, data: mintHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast({
          title: 'Transaction Submitted',
          description: 'Car minting transaction submitted successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Transaction Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const { isLoading: isMinting, isSuccess: mintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Verify car
  const { writeContract: verifyCar, data: verifyHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast({
          title: 'Verification Submitted',
          description: 'Car verification transaction submitted',
        });
      },
      onError: (error) => {
        toast({
          title: 'Verification Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const { isLoading: isVerifying } = useWaitForTransactionReceipt({
    hash: verifyHash,
  });

  // Get car details
  const { data: carDetails, refetch: refetchCarDetails } = useReadContract({
    address: getContractAddress('carNFT', 31337), // Default to hardhat
    abi: getContractABI('carNFT'),
    functionName: 'getCarDetails',
    args: [], // Will be set when called
  });

  // Get token URI
  const { data: tokenURI } = useReadContract({
    address: getContractAddress('carNFT', 31337),
    abi: getContractABI('carNFT'),
    functionName: 'tokenURI',
    args: [], // Will be set when called
  });

  // Check if VIN exists
  const { data: vinExists } = useReadContract({
    address: getContractAddress('carNFT', 31337),
    abi: getContractABI('carNFT'),
    functionName: 'vinExists',
    args: [], // Will be set when called
  });

  const handleMintCar = async (
    to: string,
    vin: string,
    make: string,
    model: string,
    year: number,
    metadataURI: string
  ) => {
    try {
      await mintCar({
        address: getContractAddress('carNFT', 31337),
        abi: getContractABI('carNFT'),
        functionName: 'mintCar',
        args: [to, vin, make, model, year, metadataURI],
      });
    } catch (error) {
      throw error;
    }
  };

  const handleVerifyCar = async (tokenId: bigint) => {
    try {
      await verifyCar({
        address: getContractAddress('verifierOracle', 31337),
        abi: getContractABI('verifierOracle'),
        functionName: 'verifyCar',
        args: [tokenId],
      });
    } catch (error) {
      throw error;
    }
  };

  const getCarDetails = async (tokenId: bigint) => {
    try {
      // Use direct contract read for dynamic calls
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('../config/wagmi');
      const details = await readContract(config, {
        address: getContractAddress('carNFT', 31337),
        abi: getContractABI('carNFT'),
        functionName: 'getCarDetails',
        args: [tokenId],
      });
      return details;
    } catch (error) {
      throw error;
    }
  };

  const getTokenURI = async (tokenId: bigint) => {
    try {
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('../config/wagmi');
      const uri = await readContract(config, {
        address: getContractAddress('carNFT', 31337),
        abi: getContractABI('carNFT'),
        functionName: 'tokenURI',
        args: [tokenId],
      });
      return uri;
    } catch (error) {
      throw error;
    }
  };

  const checkVinExists = async (vin: string) => {
    try {
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('../config/wagmi');
      const exists = await readContract(config, {
        address: getContractAddress('carNFT', 31337),
        abi: getContractABI('carNFT'),
        functionName: 'vinExists',
        args: [vin],
      });
      return exists;
    } catch (error) {
      throw error;
    }
  };

  return {
    // State
    carDetails,
    tokenURI,
    vinExists,
    isMinting,
    mintSuccess,
    isVerifying,

    // Actions
    handleMintCar,
    handleVerifyCar,
    getCarDetails,
    getTokenURI,
    checkVinExists,
  };
};

