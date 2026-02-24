const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://saljjjmmwmdmtkmqzmpo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbGpqam1td21kbXRrbXF6bXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwNjI3NiwiZXhwIjoyMDg1NzgyMjc2fQ.JIN1-GDapmEEJUzHZplPzI0lZPkgdCeFTMNjj-4RFl8";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: "jairomatosve@gmail.com",
        password: "Jv_prueba123!",
        email_confirm: true,
    });
    console.log("Create Data:", data.user ? "Created User ID " + data.user.id : "NO USER");
    console.log("Create Error:", error ? error.message : "NO ERROR");
}

test();
