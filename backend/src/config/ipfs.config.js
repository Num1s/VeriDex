import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import config from './index.js';

class IPFSService {
  constructor() {
    this.gateway = config.ipfs.gateway;
    this.pinataJwt = config.ipfs.pinataJwt;
    this.pinataApiKey = config.ipfs.pinataApiKey;
    this.pinataSecretKey = config.ipfs.pinataSecretKey;
  }

  /**
   * Upload file to IPFS via Pinata
   * @param {Buffer} fileBuffer - File buffer to upload
   * @param {string} fileName - Original file name
   * @returns {Promise<string>} - IPFS hash
   */
  async uploadFile(fileBuffer, fileName) {
    try {
      if (!this.pinataJwt && (!this.pinataApiKey || !this.pinataSecretKey)) {
        throw new Error('Pinata credentials not configured');
      }

      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: this.getContentType(fileName),
      });

      // Use JWT if available, otherwise fallback to API keys
      const headers = this.pinataJwt 
        ? {
            'Authorization': `Bearer ${this.pinataJwt}`,
            ...formData.getHeaders(),
          }
        : {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            ...formData.getHeaders(),
          };

      console.log('🔄 Uploading file to Pinata IPFS:', fileName);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        { 
          headers,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      if (response.data.IpfsHash) {
        const ipfsUrl = `${this.gateway}${response.data.IpfsHash}`;
        console.log(`✅ File uploaded to IPFS: ${ipfsUrl}`);
        return response.data.IpfsHash;
      } else {
        throw new Error('Failed to get IPFS hash from response');
      }
    } catch (error) {
      console.error('❌ IPFS upload error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Upload JSON metadata to IPFS
   * @param {Object} metadata - JSON metadata object
   * @returns {Promise<string>} - IPFS hash
   */
  async uploadMetadata(metadata) {
    try {
      if (!this.pinataJwt && (!this.pinataApiKey || !this.pinataSecretKey)) {
        throw new Error('Pinata credentials not configured');
      }

      // Use JWT if available, otherwise fallback to API keys
      const headers = this.pinataJwt
        ? {
            'Authorization': `Bearer ${this.pinataJwt}`,
            'Content-Type': 'application/json',
          }
        : {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            'Content-Type': 'application/json',
          };

      console.log('🔄 Uploading metadata to Pinata IPFS');

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        { headers }
      );

      if (response.data.IpfsHash) {
        const ipfsUrl = `${this.gateway}${response.data.IpfsHash}`;
        console.log(`✅ Metadata uploaded to IPFS: ${ipfsUrl}`);
        return response.data.IpfsHash;
      } else {
        throw new Error('Failed to get IPFS hash from response');
      }
    } catch (error) {
      console.error('❌ IPFS metadata upload error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get content type based on file extension
   * @param {string} filename - File name
   * @returns {string} - Content type
   */
  getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get full IPFS URL from hash
   * @param {string} hash - IPFS hash
   * @returns {string} - Full IPFS URL
   */
  getUrl(hash) {
    return `${this.gateway}${hash}`;
  }

  /**
   * Validate IPFS hash format
   * @param {string} hash - IPFS hash to validate
   * @returns {boolean} - True if valid format
   */
  isValidHash(hash) {
    // IPFS hash should be 46 characters long and start with 'Qm'
    return typeof hash === 'string' && hash.length === 46 && hash.startsWith('Qm');
  }
}

const ipfsService = new IPFSService();

export default ipfsService;

