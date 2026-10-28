
const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

// GET /api/village-pools
router.get("/", async (req, res) => {
  try {
    const { status, village, crop_id } = req.query;

    const allowedStatuses = [
      "open",
      "ready_for_sale",
      "purchased"
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pool status."
      });
    }

    let query = supabase
      .from("active_village_pools")
      .select("*")
      .order("village", { ascending: true });

    // By default, return pools available for pooling or sale.
    if (status) {
      query = query.eq("status", status);
    } else {
      query = query.in("status", ["open", "ready_for_sale"]);
    }

    if (village) {
      query = query.ilike("village", village);
    }

    if (crop_id) {
      query = query.eq("crop_id", crop_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      pools: data
    });
  } catch (error) {
    console.error("Fetch village pools failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch village pools."
    });
  }
});

module.exports = router;
