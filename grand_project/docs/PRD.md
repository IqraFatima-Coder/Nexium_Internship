# 🍲 NextMeal – Your AI-Powered Kitchen Assistant

## 💭 Problem Statement
“Aj kya pakayen?” is a daily struggle in every household.  
People often don’t know what to cook. Either they forget what ingredients they have, or are unsure what’s possible with limited ingredients, time or tools. This leads to food waste, unhealthy choices, and frustration, especially during odd meal times or late-night cravings.

## 💡 Solution Summary
NextMeal helps users discover AI-generated recipes based on what’s available in their fridge and kitchen. Users can:

- Maintain a **smart inventory** of groceries and fridge items
- Let the app suggest recipes using AI (via `n8n`)
- Filter based on **location**, **cooking tools** (stove, air fryer, grill), and **diet**
- Plan future meals and even generate a grocery list

It’s like having your own intelligent kitchen assistant — personalized and practical.

## 🔑 Core Features (MVP)
- ✉️ **Magic Link Login** (Supabase Auth)
- 🧾 **Smart Ingredient Input** (Fridge + Grocery tracker)
- 🤖 **AI Recipe Generator** (n8n + OpenAI)
- 🔍 **Filter Recipes By**:
  - Tools available (e.g. Stove, Oven, Microwave Oven, Air Fryer, Grill)
  - Diet (Veg, Non-Veg, Oil-Free, etc.)
  - Location (for regional cuisines)
- 💬 **Recipe Output** with steps, time, and tips
- 📦 **Deployed on Vercel** via CI/CD

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 + ShadCN UI + DaisyUI
- **Backend**: Supabase (Auth + DB)
- **AI Logic**: n8n + LLM Agent
- **CI/CD**: GitHub + Vercel

## 🚶 User Flow
1. Login via email
2. Input or select saved ingredients from fridge/grocery
3. Choose appliance + dietary preference
4. AI suggests a recipe with steps
5. Optionally save/share or update fridge list

## 📈 Success Criteria
- Working app deployed on Vercel
- Accepts ingredients + generates relevant recipes
- Filters by appliances + dietary type
- Clean UI and usable flow
- PRD, wireframes, walkthrough + demo complete
