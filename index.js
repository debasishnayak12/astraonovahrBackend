require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { sendAdminMail, sendUserConfirmationMail } = require('./utils/mailer');
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// ✅ Save contact form
app.post('/contact', async (req, res) => {
  try {
    let {
      first_name,
      last_name,
      email,
      company,
      service,
      message
    } = req.body;

    // ✅ Validation (same as before)
    first_name = first_name?.trim();
    last_name = last_name?.trim();
    email = email?.trim();
    message = message?.trim();

    if (!first_name || !last_name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // ✅ Insert into DB
    const { error } = await supabase
      .from('contacts')
      .insert([{
        first_name,
        last_name,
        email,
        company,
        service,
        message
      }]);

    if (error) throw error;

    // ✅ Send emails (parallel for speed)
    await Promise.all([
      sendAdminMail(req.body),
    //   sendUserConfirmationMail(req.body)
    ]);
    return res.json({
      success: true,
      message: "Thank you for reaching out to AstranovaHR."
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


app.get('/messages', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' }) // 👈 important
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({
      success: true,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});