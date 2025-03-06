const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        size: {
          type: String,  // Optional: if product size is relevant
        },
        imageUrl: {
          type: String, // Optional: product image URL
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    shippingDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    trackingNumber: {
      type: String,  // Optional: if you want to track shipments
    },
    carrier: {
      type: String,  // Optional: carrier name (e.g., USPS, FedEx, etc.)
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    paymentDetails: {
      type: String,  // Optional: store payment-related details (payment ID, method)
    },
    discountAmount: {
      type: Number,  // Optional: Discount applied to the order
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Pending', 'Shipped', 'Cancelled', 'Completed'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Order', orderSchema);
