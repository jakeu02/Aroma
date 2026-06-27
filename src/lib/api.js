import { supabase, isSupabaseConfigured, createAuthOnlyClient } from './supabase';

const NOT_CONFIGURED = {
  error: 'Online ordering is not set up yet. Add your Supabase credentials to enable it.',
};

// Places an order + its line items. Returns { data } or { error }.
export async function placeOrder({
  customer, orderType, items, subtotal, tax, total, userId, tableLabel, status,
}) {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId || null,
      customer_name: customer.name,
      phone: customer.phone || '',
      email: customer.email || null,
      order_type: orderType,
      table_label: tableLabel || null,
      status: status || 'pending',
      subtotal,
      tax,
      total,
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  const orderItems = items.map((item) => {
    const sizeExtra = item.product.sizes?.[item.size] || 0;
    return {
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      size: item.size || null,
      quantity: item.quantity,
      unit_price: item.product.price + sizeExtra,
      notes: item.notes || null,
    };
  });

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return { error: itemsError.message };

  return { data: order, orderCode: order.order_code };
}

export async function submitFeedback({
  rating, productRating, serviceRating, deliveryRating,
  comment, customerName, orderId, userId,
}) {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  // Overall = average of whichever dimensions were provided.
  const parts = [productRating, serviceRating, deliveryRating].filter(Boolean);
  const overall = rating || (parts.length
    ? Math.round(parts.reduce((s, v) => s + v, 0) / parts.length)
    : null);

  const { error } = await supabase.from('feedback').insert({
    rating: overall,
    product_rating: productRating || null,
    service_rating: serviceRating || null,
    delivery_rating: deliveryRating || null,
    comment: comment || null,
    customer_name: customerName || null,
    order_id: orderId || null,
    user_id: userId || null,
  });
  return error ? { error: error.message } : { data: true };
}

// Admin creates (or promotes) a staff account. Uses a throwaway auth client to
// register the user so the admin's own session is untouched, then sets the role.
export async function createStaffAccount({ email, password, role }) {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const temp = createAuthOnlyClient();
  let userId = null;

  const { data, error } = await temp.auth.signUp({ email, password });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      // Account already exists — just promote the existing profile.
      const { data: prof } = await supabase
        .from('profiles').select('id').eq('email', email).maybeSingle();
      if (!prof) return { error: 'That email already has an account; ask them to sign in once, then promote them.' };
      userId = prof.id;
    } else {
      return { error: error.message };
    }
  } else {
    userId = data?.user?.id;
  }
  if (!userId) return { error: 'Could not determine the new user.' };

  const { error: upErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, role });
  if (upErr) return { error: upErr.message };
  return { data: true };
}

export async function updateStaffRole(id, role) {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  return error ? { error: error.message } : { data: true };
}

export async function submitContactMessage({ name, email, subject, message }) {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;
  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject: subject || null,
    message,
  });
  return error ? { error: error.message } : { data: true };
}
