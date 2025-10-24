'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import VerificationBadge from './VerificationBadge';
import { formatAddress, formatCarName, formatPrice, formatDate } from '../utils/formatters';
import { formatListingStatus } from '../utils/formatters';
import {
  Eye,
  ShoppingCart,
  Edit,
  X,
  Search,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Listing {
  id: string;
  listingId: number;
  tokenId: number;
  sellerAddress: string;
  price: string;
  status: string;
  description?: string;
  images: Array<{ url: string; filename: string }>;
  car: {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    verificationStatus: string;
  };
  createdAt: string;
  soldAt?: string;
  soldTo?: string;
}

interface ListingTableProps {
  listings: Listing[];
  showActions?: boolean;
  onPurchase?: (listing: Listing) => void;
  onEdit?: (listing: Listing) => void;
  onCancel?: (listing: Listing) => void;
  isLoading?: boolean;
}

type SortField = 'price' | 'createdAt' | 'make' | 'year';
type SortOrder = 'asc' | 'desc';

export default function ListingTable({
  listings,
  showActions = true,
  onPurchase,
  onEdit,
  onCancel,
  isLoading = false,
}: ListingTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort listings
  const filteredAndSortedListings = listings
    .filter(listing => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        listing.car.vin.toLowerCase().includes(query) ||
        listing.car.make.toLowerCase().includes(query) ||
        listing.car.model.toLowerCase().includes(query) ||
        listing.sellerAddress.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'make':
          aValue = a.car.make.toLowerCase();
          bValue = b.car.make.toLowerCase();
          break;
        case 'year':
          aValue = a.car.year;
          bValue = b.car.year;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <SortAsc className="w-4 h-4" />
    ) : (
      <SortDesc className="w-4 h-4" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Listings...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading marketplace data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Listings ({filteredAndSortedListings.length})
        </CardTitle>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by VIN, make, model, or seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredAndSortedListings.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">Car</th>
                      <th 
                        className="pb-3 cursor-pointer hover:text-primary"
                        onClick={() => handleSort('make')}
                      >
                        <div className="flex items-center gap-1">
                          Make/Model
                          <SortIcon field="make" />
                        </div>
                      </th>
                      <th 
                        className="pb-3 cursor-pointer hover:text-primary"
                        onClick={() => handleSort('year')}
                      >
                        <div className="flex items-center gap-1">
                          Year
                          <SortIcon field="year" />
                        </div>
                      </th>
                      <th 
                        className="pb-3 cursor-pointer hover:text-primary"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center gap-1">
                          Price
                          <SortIcon field="price" />
                        </div>
                      </th>
                      <th className="pb-3">Seller</th>
                      <th className="pb-3">Status</th>
                      <th 
                        className="pb-3 cursor-pointer hover:text-primary"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Listed
                          <SortIcon field="createdAt" />
                        </div>
                      </th>
                      {showActions && <th className="pb-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedListings.map((listing) => (
                      <tr key={listing.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={listing.images[0]?.url || '/placeholder-car.jpg'}
                                alt={formatCarName(listing.car)}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{formatCarName(listing.car)}</div>
                              <div className="text-sm text-gray-600 font-mono">
                                {listing.car.vin}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{listing.car.make}</div>
                            <div className="text-sm text-gray-600">{listing.car.model}</div>
                          </div>
                        </td>
                        <td className="py-3 font-medium">
                          {listing.car.year}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-green-600">
                            {formatPrice(listing.price)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-mono text-sm">
                            {formatAddress(listing.sellerAddress)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const status = formatListingStatus(listing.status);
                              return (
                                <Badge className={status.color} variant="outline">
                                  {status.text}
                                </Badge>
                              );
                            })()}
                            <VerificationBadge status={listing.car.verificationStatus} size="sm" />
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {formatDate(listing.createdAt)}
                        </td>
                        {showActions && (
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/cars/${listing.car.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>

                              {onPurchase && listing.status === 'active' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => onPurchase(listing)}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </Button>
                              )}

                              {onEdit && listing.status === 'active' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => onEdit(listing)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}

                              {onCancel && listing.status === 'active' && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => onCancel(listing)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredAndSortedListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={listing.images[0]?.url || '/placeholder-car.jpg'}
                          alt={formatCarName(listing.car)}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {formatCarName(listing.car)}
                          </h3>
                          <VerificationBadge status={listing.car.verificationStatus} size="sm" />
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div>VIN: {listing.car.vin}</div>
                          <div>Seller: {formatAddress(listing.sellerAddress)}</div>
                          <div>Listed: {formatDate(listing.createdAt)}</div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="font-bold text-lg text-green-600">
                            {formatPrice(listing.price)}
                          </div>

                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/cars/${listing.car.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>

                            {onPurchase && listing.status === 'active' && (
                              <Button size="sm" onClick={() => onPurchase(listing)}>
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No listings found</h3>
            <p>
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'No listings match the current filters'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

