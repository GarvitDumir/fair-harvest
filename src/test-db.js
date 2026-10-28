
require("dotenv").config();

const supabase = require("./lib/supabase");

async function testDatabase() {
  try {
    const { data, error } = await supabase
      .from("crops")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Database query failed:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log("Supabase connection successful!");
    console.log("Crops table is accessible.");
    console.log("Rows returned:", data.length);
  } catch (error) {
    console.error("Connection test failed:", error.message);
    process.exitCode = 1;
  }
}

testDatabase();
