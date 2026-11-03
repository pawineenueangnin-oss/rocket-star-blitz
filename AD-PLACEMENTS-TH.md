# ตำแหน่งโฆษณา Starzoomer (v9)

ทุกโฆษณาเรียกผ่าน `window.AndroidAds` (สะพานจากแอป Android) เท่านั้น
- บนเว็บปกติ (ไม่มีสะพาน): ไม่แสดงโฆษณาใด ๆ, ปุ่มรางวัล (x2 / เล่นต่อ) ให้รางวัลทันทีโดยไม่มีโฆษณา
- ในโค้ดใช้เฉพาะ **Google TEST ad unit IDs** (`RSB_AD_UNITS` ใน core.js) ห้ามใส่ ID จริงในเว็บ

## 1) แบนเนอร์ (Banner) — `rsb_banner_menu`
- **ที่ไหน:** ขอบล่างของจอ เมนู / แผนที่ด่าน / Hangar / ตั้งค่า / หน้าผลด่าน (Stage Clear, Game Over)
- **ไม่แสดง:** ระหว่างเล่น, หยุดชั่วคราว, ฉาก Warp (กันกดพลาด และให้ปุ่มควบคุมเข้าถึงได้เสมอ)
- หน้าเมนูจะเว้นพื้นที่ด้านล่าง ~66px + safe-area (`body.banner`) ปุ่มไม่ถูกแบนเนอร์บัง ทดสอบแล้วที่ 360x640
- แสดงเฉพาะเมื่อมี `window.AndroidAds` (หรือโหมดพรีวิว)

## 2) โฆษณาคั่นเต็มจอ (Interstitial) — `rsb_inter_stage_end`
- **เมื่อไร:** หลังกด "Next" ในหน้าสรุปคะแนน Stage Clear → โฆษณา → ปิดแล้วจึงเริ่ม Warp → ด่านถัดไป
- **กฎ:** ตั้งแต่ด่าน 3 ขึ้นไป, ห่างกันอย่างน้อย 90 วินาที, ไม่แสดงทันทีหลังเปิดแอป (นับ 90 วิ ตั้งแต่เปิด), ไม่แสดงระหว่างเล่นหรือระหว่าง Warp, ไม่มีในโหมด Endless
- แอปต้องเรียก `window.onInterstitialClosed()` เมื่อโฆษณาปิด (มี timeout สำรอง 45 วิ / กลับมาที่แอป)

## 3) โฆษณารับรางวัล (Rewarded) — สูงสุด 2 ครั้งต่อด่าน
- **เหรียญ x2:** ปุ่มชมพู "Double credits (video)" ในหน้า Stage Clear
- **เล่นต่อ + โล่:** ปุ่ม "Continue (video)" ในหน้า Game Over → ฟื้น 1 ชีวิต + โล่ 1 + ระเบิด 2 (ใช้ได้ครั้งเดียวต่อรอบ)
- ผู้เล่นเลือกเองเสมอ ไม่มีนับถอยหลังกดดัน ไม่มีรางวัลจากการแชร์ มีข้อความครบ 21 ภาษา
- แอปเรียก `window.onRewardEarned()` แล้ว `window.onRewardedClosed()` (ดู core.js `Ads.rewarded`)

## วิธีพรีวิว (บนเว็บ)
- เปิด `https://<site>/?test=1` → โหมดทดสอบติดถาวร (localStorage `rsb_adtest`), มีชิป "AD TEST MODE" ด้านบน
- แบนเนอร์: แถบลายเขียว "AD TEST · Banner" ที่เมนู/แผนที่/Hangar/ตั้งค่า/ผลด่าน
- Interstitial: เล่นด่าน 3+ จนผ่าน → กด Next → กล่อง "AD TEST · Interstitial" กด ✕ แล้ว Warp จะเริ่ม (กดชิปเลือก fast เพื่อลดระยะห่างเหลือ 2.5 วิ)
- Rewarded: กด "Double credits (video)" หรือ "Continue (video)" → กล่อง "AD TEST · Rewarded" รอ 3 วิ แล้ว Claim / Skip
- ปิดโหมด: กดชิป AD TEST MODE → ปิด หรือเปิด `?test=0`

## สิ่งที่แอป Android ต้องทำ (ใช้ ID จริง)
1. เพิ่ม Google Mobile Ads SDK, ใส่ **App ID จริง** ใน AndroidManifest (`com.google.android.gms.ads.APPLICATION_ID`)
2. สร้าง ad unit จริง 3 ตัวใน AdMob (Banner, Interstitial, Rewarded) แล้ว map ชื่อ `rsb_banner_menu`, `rsb_inter_stage_end`, `rsb_reward_continue` → ID จริง **ในฝั่ง Android** (ไม่ใช่ในเว็บ)
3. `addJavascriptInterface(..., "AndroidAds")` ให้มีเมธอด: `showBanner()`, `hideBanner()`, `showInterstitial()`, `showRewarded()` (คืน false ถ้าไม่มีโฆษณา)
4. callback กลับเว็บ: `onInterstitialClosed()`, `onRewardEarned()` เมื่อดูครบ และ `onRewardedClosed()` / `onRewardedFailed()`, ปุ่ม Back → `onAndroidBack()` (คืนค่า false = ออกจากแอปได้)
5. ตั้งค่าเด็ก/ครอบครัว: `tagForChildDirectedTreatment`, `tagForUnderAgeOfConsent`, max content rating G, non-personalized ads (สอดคล้องกับ privacy.html)
6. ระหว่างพัฒนาให้ใช้ test IDs ของ Google และเพิ่ม test device เสมอ
