import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch user orders with items from Supabase
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not retrieve orders from Supabase:", error.message);
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    console.error("Order fetch error:", err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      totalAmount,
      atelierNotes,
    } = body;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Generate unique order number (e.g. THV-84291)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `THV-${randomDigits}`;

    // Estimated delivery in 5 business days
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Insert order header
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: customerName || "Esteemed Client",
        customer_email: customerEmail || user?.email || "",
        customer_phone: customerPhone || "",
        shipping_address: shippingAddress || {},
        subtotal: Number(subtotal || totalAmount || 0),
        total_amount: Number(totalAmount || 0),
        status: "Artisan Crafting",
        payment_status: "Paid",
        atelier_notes: atelierNotes || null,
        estimated_delivery: estimatedDelivery,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    // Insert order items
    if (items && Array.isArray(items) && items.length > 0) {
      const orderItemsToInsert = items.map((item: any) => ({
        order_id: order.id,
        product_id: String(item.id || item.product_id),
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity || 1),
        image: item.img || item.image || null,
      }));

      await supabase.from("order_items").insert(orderItemsToInsert);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order." },
      { status: 400 }
    );
  }
}
