const User = require('../models/user.model.js')
const Product = require('../models/product.model.js')
const Order = require("../models/order.model.js")
const Tags = require('../models/tags.model.js')
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin.model.js');
const Shops = require('../models/shop.model.js');
const Vendor = require("../models/vendor.model.js")
const Agent = require("../models/agent.model.js")
const Distribute = require('../models/distribute-order.model.js')
const RequestOrder = require('../models/requestorder.model.js')
const ManualOrder = require('../models/manualorder.model.js')



const CheckoutAdress = require('../models/checkoutadress.model')
const bwipjs = require('bwip-js');
const uploadFileToS3 = require('../utils/fileUpload.js')
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


const getNextSequentialId = async (ids) => {
  let existingIds = [];
  let lastId;
  let idPrefix;
  let idLength = 8;

  if (ids === "AKCUS") {
    idPrefix = "AKCUS";
    lastId = await User.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.userId ? lastId.userId : "");
  }
  if (ids === "PD") {
    idPrefix = "PD";
    lastId = await Product.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.productId ? lastId.productId : "");
  }
  if (ids === "ADMIN") {
    idPrefix = "ADMIN";
    lastId = await Admin.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.adminId ? lastId.adminId : "");
  }
  if (ids === "SHOP") {
    idPrefix = "SHOP";
    lastId = await Shops.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.shop_id ? lastId.shop_id : "");
  }
  if (ids === "ORDER") {
    idPrefix = "ORDER";
    lastId = await Order.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.orderId ? lastId.orderId : "");
  }
  if (ids === "VEN") {
    idPrefix = "VEN";
    lastId = await Vendor.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.vendorId ? lastId.vendorId : "");
  }
  if (ids === "AGENT") {
    idPrefix = "AGENT";
    lastId = await Agent.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.agentId ? lastId.agentId : "");
  }
  if (ids === "TRANS") {
    idPrefix = "TRANS";
    lastId = await Distribute.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.transaction_id ? lastId.transaction_id : "");
  }
  if (ids === "REQ") {
    idPrefix = "REQ";
    lastId = await RequestOrder.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.reqId ? lastId.reqId : "");
  }
  if (ids === "TOKEN") {
    idPrefix = "TOKEN";
    lastId = await ManualOrder.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.tokenId ? lastId.tokenId : "");
  }
  // Uncomment the else block if needed
  // else {
  //   idPrefix = "AKPD";
  //   lastId = await Product.findOne().sort({ _id: -1 });
  //   existingIds.push(lastId && lastId.productId ? lastId.productId : "");
  // }

  const maxNumericPart = existingIds.reduce((max, id) => {
    if (!id || !id.startsWith(idPrefix)) return max; // Check if id is undefined or doesn't start with idPrefix

    const numericPart = parseInt(id.substring(idPrefix.length), 10);
    return numericPart > max ? numericPart : max;
  }, 0);

  const nextCount = maxNumericPart + 1;
  const paddedCount = String(nextCount).padStart(idLength - (idPrefix ? idPrefix.length : 0), "0");
  const nextId = idPrefix + paddedCount;


  return nextId;
};

const checkPassword = async (password, hashedPassword) => {
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};


const getLastAndIncrementId = async () => {
  try {
    // Find the document with the highest ID
    const lastTag = await Tags.aggregate([
      { $group: { _id: null, tag_id: { $max: "$tag_id" } } }
    ]);

    // If there are no tags yet, start with ID 1
    let newId = 1;

    // If there are tags, increment the maximum ID by 1
    if (lastTag.length > 0) {
      newId = lastTag[0].tag_id + 1;
    }

    return newId;
  } catch (error) {
    console.error("Error occurred while getting and incrementing the last ID:", error);
    throw error;
  }
};

const getLastTypeId = async () => {
  try {
    // Find the document with the highest ID
    const lastTag = await Shops.aggregate([
      { $group: { _id: null, type: { $max: "$type" } } }
    ]);

    // If there are no tags yet, start with ID 1
    let newId = 1;

    // If there are tags, increment the maximum ID by 1
    if (lastTag.length > 0) {
      newId = lastTag[0].type + 1;
    }

    return newId;
  } catch (error) {
    console.error("Error occurred while getting and incrementing the last ID:", error);
    throw error;
  }
};




const getLastAdressId = async () => {
  try {
    // Find the document with the highest ID
    const lastTag = await CheckoutAdress.aggregate([
      { $group: { _id: null, id: { $max: "$id" } } }
    ]);

    // If there are no tags yet, start with ID 1
    let newId = 1;

    // If there are tags, increment the maximum ID by 1
    if (lastTag.length > 0) {
      newId = lastTag[0].id + 1;
    }

    return newId;
  } catch (error) {
    console.error("Error occurred while getting and incrementing the last ID:", error);
    throw error;
  }
};


const generateAndUploadBarcode = (productId) => {

  try {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer({
        bcid: 'code128',       // Barcode type
        text: productId,       // Text to encode (Product ID)
        scale: 3,               // 3x scaling factor
        height: 20,              // Bar height, in millimeters
        includetext: true,      // Include human-readable text
        textxalign: 'center',   // Align the text at the center
      }, async (err, png) => {
        if (err) return reject(err);

        const fileName = `${productId}.png`;
        // const filePath = path.join(__dirname, fileName);
        const bucketName = process.env.S3_BUCKT_NAME;

        // fs.writeFile(filePath, png, async (err) => {
        //     if (err) return reject(err);

        // Upload to S3
        // const fileStream = fs.createReadStream(filePath);
        const barUrl = await uploadFileToS3(bucketName, fileName, png);
        resolve(barUrl);
        // });
      });
    });

  } catch (error) {
    console.error("Error occurred:", error.stack);
    throw error;
  }
}


const checkExpiry = (expiryDate) => {
  const currentDate = new Date();
  const expiry = new Date(expiryDate);

  // Calculate the difference in time
  const timeDiff = expiry.getTime() - currentDate.getTime();

  if (timeDiff < 0) {
    return "Expired already";
  } else {
    let years = expiry.getFullYear() - currentDate.getFullYear();
    let months = expiry.getMonth() - currentDate.getMonth();
    let days = expiry.getDate() - currentDate.getDate();
    let hours = expiry.getHours() - currentDate.getHours();
    let minutes = expiry.getMinutes() - currentDate.getMinutes();
    let seconds = expiry.getSeconds() - currentDate.getSeconds();

    // Adjust for negative seconds
    if (seconds < 0) {
      minutes -= 1;
      seconds += 60;
    }

    // Adjust for negative minutes
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    // Adjust for negative hours
    if (hours < 0) {
      days -= 1;
      hours += 24;
    }

    // Adjust for negative days, months, etc.
    if (days < 0) {
      months -= 1;
      days += new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    let result = "";

    if (years > 0) {
      result += `${years} year${years > 1 ? 's' : ''}, `;
    }
    if (months > 0 || years > 0) {
      result += `${months} month${months > 1 ? 's' : ''}, `;
    }
    result += `${days} day${days > 1 ? 's' : ''}, `;
    result += `${hours} hour${hours !== 1 ? 's' : ''}, `;
    result += `${minutes} minute${minutes !== 1 ? 's' : ''} time left to expire`;

    return result;
  }
}




module.exports = {
  getNextSequentialId,
  checkPassword,
  getLastAndIncrementId,
  getLastTypeId,
  getLastAdressId,
  generateAndUploadBarcode,
  checkExpiry
}

