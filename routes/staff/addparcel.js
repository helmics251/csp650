const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const moment = require("moment");
const uuid = require("uuid");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (req.session.staff) {
    if (req.session.staff.isAdmin) {
      return res.render("guest/error404");
    }
    const staffList = await Staff.findOne({
      staffId: req.session.staff.staffId,
    });

    if (staffList.pricing && staffList.pricing.length > 0) {
      const messages = req.flash();
      return res.render("staff/addparcel", {
        staffData: staffList,
        messages: messages,
      });
    }
    return res.redirect("/staffsetting");
  }
  return res.render("guest/error404");
});

router.post("/", async function (req, res) {
  try {
    const {
      name,
      phone,
      locker,
      parceltype,
      tracking,
      studentNumber,
      parcelWeight,
    } = req.body;

    const cleanedPhoneNumber = cleanPhoneNumber(phone);
    const staff = await getStaff(req.session.staff.staffId);
    const priceRanges = generatePriceRanges(staff.pricing);
    const totalPrice = calculateTotalPrice(parcelWeight, priceRanges);

    if (totalPrice !== null) {
      const newParcel = createParcel(
        name,
        cleanedPhoneNumber,
        studentNumber,
        parceltype,
        tracking,
        parcelWeight,
        totalPrice
      );

      await updateStaffParcel(req.session.staff.staffId, locker, newParcel);
      await updateUserParcel(studentNumber, cleanedPhoneNumber, newParcel);

      return res.redirect("/addparcel");
    } else {
      handlePriceError(parcelWeight, res);
    }
  } catch (error) {
    console.error("Error adding parcel:", error);
    req.flash("alert", "Error Adding Parcel. Please try again.");
    return res.redirect("/staffsetting");
  }
});

function cleanPhoneNumber(phone) {
  return phone.toString().replace(/[-\s]/g, "");
}

async function getStaff(staffId) {
  return await Staff.findOne({ staffId });
}

function generatePriceRanges(pricing) {
  const sortedPriceRange = pricing.sort((a, b) => a.minWeight - b.minWeight);

  let priceRanges = [];

  for (let i = 0; i < sortedPriceRange.length; i++) {
    const current = sortedPriceRange[i];
    const next = sortedPriceRange[i + 1];

    const maxWeight = next ? next.minWeight - 1 : Infinity;

    priceRanges.push({
      minWeight: current.minWeight,
      maxWeight: maxWeight,
      price: current.price,
    });
  }

  return priceRanges;
}

function calculateTotalPrice(parcelWeight, priceRanges) {
  for (const range of priceRanges) {
    if (parcelWeight < priceRanges[0].minWeight) {
      return priceRanges[0].price;
    }

    if (parcelWeight >= range.minWeight && parcelWeight <= range.maxWeight) {
      return range.price;
    }
  }
  return null;
}

function createParcel(
  name,
  phone,
  studentNumber,
  parceltype,
  tracking,
  parcelWeight,
  totalPrice
) {
  const dateStr = new Date()
    .toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })
    .split(",")[0]
    .trim();

  const parcelID = uuid.v4();
  return {
    name,
    phone,
    studentNumber,
    parceltype,
    parcelID,
    parcelWeight,
    tracking,
    dateAdded: dateStr,
    dateCollected: null,
    isCollected: false,
    price: totalPrice,
  };
}

async function updateStaffParcel(staffId, locker, newParcel) {
  await Staff.updateOne(
    {
      staffId: staffId,
      "locker.lockerName": locker,
    },
    {
      $set: {
        "locker.$.isEmpty": false,
        "locker.$.parcel": newParcel,
      },
    },
    { upsert: true }
  );
}

async function updateUserParcel(studentNumber, cleanedPhoneNumber, newParcel) {
  const query = {
    $or: [{ studentNumber }, { phoneNumber: cleanedPhoneNumber }],
  };
  const existingUser = await User.findOne(query);
  if (existingUser) {
    await User.updateOne(query, { $push: { Parcel: newParcel } });
    console.log("🚀 ~ updateUserParcel ~ newParcel:", newParcel);

    await sendEmail(newParcel, existingUser.email);

    console.log("\nParcel Added to user account\n");
  }
}

function sendEmail(newParcel, email) {
  const subjectPrefix = "Parcel is ready for collection";
  const dynamicSubject = `${subjectPrefix} - ${new Date().toLocaleString()}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });


  const mailOptions = {
    from: process.env.DOMAIN_EMAIL,
    to: email, // Recipient's email address
    subject: dynamicSubject,
    text: `Dear ${newParcel.name},\n\nYour parcel with tracking number '${newParcel.tracking}' is ready for collection.\n\nPlease Bring RM${newParcel.price} for the payment.\n\nThank you.\n\nRegards,\nParcel Management System\n`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log("\nEmail sent: " + info.response);
    }
  });
}

function handlePriceError(parcelWeight, res) {
  console.log(`No price defined for a weight of ${parcelWeight}Kg.`);
  req.flash(
    "alert",
    `Error Adding Parcel. No price defined for ${parcelWeight}Kg.`
  );
  return res.redirect("/staffsetting");
}

module.exports = router;
