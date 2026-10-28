
const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

// POST /api/listings
router.post("/", async (req, res) => {
  try {
    const {
      farmer_id,
      crop_id,
      quantity_kg,
      village,
      quality_grade = "Grade A"
    } = req.body;

    // Validate required fields.
    if (
      !farmer_id ||
      !crop_id ||
      !village ||
      typeof village !== "string" ||
      !village.trim() ||
      typeof quantity_kg !== "number" ||
      !Number.isFinite(quantity_kg) ||
      quantity_kg <= 0 ||
      quantity_kg > 10000000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide farmer_id, crop_id, a valid village, and a positive numeric quantity_kg."
      });
    }

    if (
      typeof quality_grade !== "string" ||
      !["Grade A", "Grade B", "Grade C"].includes(quality_grade)
    ) {
      return res.status(400).json({
        success: false,
        message: "quality_grade must be Grade A, Grade B, or Grade C."
      });
    }

    // Verify that the user is a registered farmer.
    const { data: farmer, error: farmerError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", farmer_id)
      .maybeSingle();

    if (farmerError) throw farmerError;

    if (!farmer || farmer.role !== "farmer") {
      return res.status(400).json({
        success: false,
        message: "The supplied farmer_id is not a registered farmer."
      });
    }

    // Verify that the crop exists.
    const { data: crop, error: cropError } = await supabase
      .from("crops")
      .select("id, name")
      .eq("id", crop_id)
      .maybeSingle();

    if (cropError) throw cropError;

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "The supplied crop_id does not exist."
      });
    }

    // Insertion fires the PostgreSQL pooling trigger.
    const { data: inserted, error: insertError } = await supabase
      .from("listings")
      .insert({
        farmer_id,
        crop_id,
        quantity_kg,
        village: village.trim(),
        quality_grade
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    // Read the row again because the AFTER INSERT trigger
    // updates its status to "pooled".
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", inserted.id)
      .single();

    if (listingError) throw listingError;

    const { data: membership, error: membershipError } =
      await supabase
        .from("pool_memberships")
        .select("pool_id, contributed_kg")
        .eq("listing_id", listing.id)
        .single();

    if (membershipError) throw membershipError;

    const { data: pool, error: poolError } = await supabase
      .from("village_pools")
      .select("*")
      .eq("id", membership.pool_id)
      .single();

    if (poolError) throw poolError;

    return res.status(201).json({
      success: true,
      message: "Listing created and added to a village pool.",
      listing,
      pool
    });
  } catch (error) {
    console.error("Create listing failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create listing."
    });
  }
});

module.exports = router;
