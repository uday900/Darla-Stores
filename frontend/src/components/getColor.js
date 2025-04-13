export const getColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'text-green-800 bg-green-200 '
      case 'DELIVERED':
      case 'REFUNDED':
      case 'COMPLETED':
      case 'OUT_OF_DELIVERY':
        return 'text-green-600  bg-green-200';
      case 'CONFIRMED':
        return 'text-blue-800 rounded text-sm bg-blue-200';
      case 'SHIPPED':
        return 'text-yellow-600 font-bold bg-yellow-200';
      case 'CANCELLED':
      case 'CANCELED':
      case 'REFUND_INITIATED':
      case 'REFUND_ISSUED':
      case 'FAILED':
        return 'text-red-600 font-bold bg-red-200';
      case 'PENDING':
        return 'text-red-600 font-bold bg-red-200';
      case 'RETURNED':
        return 'text-red-600 font-bold bg-red-200';
      default:
        return 'text-gray-600 font-bold bg-gray-200';
    }
  };