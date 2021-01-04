const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const removeAccent = require("../util/removeAccent");
var id = mongoose.Types.ObjectId;

const productSchema = new Schema({
  subId: {
    size: [{
      _id:false,
      id: String,
      name: String,
      price: Number,
      color: [{
        _id:false,
        id: String,
        name: String,
        amount: Number
      }]
    }]
  },
  name: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  productType: {
    main: {
      id: String,
      name: String
    },
    sub: {
      id: String,
      name: String
    },
  },
  pattern: {
    type: [String],
    required: false
  },
  listInventory: {
    type: [String]
  },
  tags: {
    type: [String],
    required: false
  },
  images: {
    type: String,
    required: false
  },
  subImages: {
    type: [String],
    required: false
  },
  brand: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    default: "Một sản phẩm từ perlC"
  },
  dateAdded: {
    type: Date,
    required: false,
    default: Date.now
  },
  isSale: {
    status: {
      type: Boolean,
      default: false
    },
    percent: {
      type: Number,
      default: 0
    },
    end: {
      type: Date
    }
  },
  ofSellers: {
    userId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "User"
    },
    name: String
  },
  labels: {
    type: String,
    required: false,
    default: "Shiro"
  },
  materials: {
    type: String,
    required: true
  },
  buyCounts: {
    type: Number,
    required: false,
    default: 0
  },
  viewCounts: {
    type: Number,
    required: false,
    default: 0
  },
  rating: {
    byUser: String,
    content: String,
    star: Number
  },
  index: {
    type: Number,
    required: false,
    default: 0
  },
  comment: {
    total: {
      type: Number,
      require: false,
      default: 0
    },
    items: [
      {
        title: {
          type: String
        },
        content: {
          type: String
        },
        name: {
          type: String
        },
        date: {
          type: Date,
          default: Date.now
        },
        star: {
          type: Number
        }
      }
    ]
  }
});

const index = {
  name: "text",
  description: "text",
  labels: "text",
  "productType.main": "text",
  tags: "text",
  ofSellers: "text"
};
productSchema.index(index);

productSchema.methods.getNonAccentType = function() {
  return removeAccent(this.productType.main);
};

const Product = mongoose.model("product", productSchema);
module.exports = Product;
