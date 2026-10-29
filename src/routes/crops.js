
const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

// GET /api/crops
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("crops")
      .select("id, name, mandi_price_per_kg, icon_name")
      .order("name", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      crops: data
    });
  } catch (error) {
    console.error("Fetch crops failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch crops."
    });
  }
});

module.exports = router;
