# 🚀 ACTION PLAN: ĐẠT 100% MATCHING PG88.COM

## 📋 PRIORITY FIXES (Để đạt 100%)

### 1️⃣ **LOGO/BRANDING** (Priority: HIGH)

**Hiện tại:**
```jsx
// Header.tsx (line 51-52)
<div className="logo">
  PG88
</div>
```

**Cần sửa:**
```jsx
<div className="logo">
  <img src="/assets/logo-pg88.png" alt="PG88" style={{height: '40px'}} />
</div>
```

**Các bước:**
- [ ] Tải logo PNG/SVG từ pg88.com
- [ ] Lưu vào `/apps/frontend/public/assets/logo-pg88.png`
- [ ] Update Header component
- [ ] Update favicon tại `index.html`

---

### 2️⃣ **PROVIDER LOGOS** (Priority: HIGH)

**Hiện tại:**
```
Footer.tsx (line 70-78) cố gắng load từ:
/assets/providers/{provider}.png
```

**Vấn đề:**
- ❌ File không tồn tại

**Cần làm:**
- [ ] Tạo thư mục: `/apps/frontend/public/assets/providers/`
- [ ] Download 15 provider logos:
  ```
  ae_lottery.png, ag.png, allbet.png, bbin.png, bng.png,
  cq9.png, dg.png, evo.png, jili.png, mg.png,
  pg.png, pp.png, saba.png, spadegaming.png, wm.png
  ```
- [ ] Test footer provider carousel

**Status:** ⚠️ Footer shows without images (not breaking)

---

### 3️⃣ **SPORTS DATA SEEDING** (Priority: MEDIUM)

**Hiện tại:**
```
Backend: Sports module is empty
- Sports: 0
- Leagues: 0
- Matches: 0
```

**Cần làm:**

Tạo file seed data:
```bash
apps/backend/src/sports/seeds/sports.seed.ts
```

**Dữ liệu cần thêm:**
```typescript
// 3-5 sports
Sports: [
  { id: '...', name: 'Bóng Đá', sortOrder: 1 },
  { id: '...', name: 'Tennis', sortOrder: 2 },
  { id: '...', name: 'Basketball', sortOrder: 3 },
]

// 10-15 leagues
Leagues: [
  { id: '...', sportId: '...', name: 'Premier League', sortOrder: 1 },
  { id: '...', sportId: '...', name: 'La Liga', sortOrder: 2 },
  ...
]

// 20-30 matches
Matches: [
  {
    id: '...',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    startTime: new Date(),
    status: 'LIVE',
    homeScore: 2,
    awayScore: 1,
    leagueId: '...'
  },
  ...
]

// Odds for each match
Odds: [
  {
    id: '...',
    matchId: '...',
    betType: '1X2',
    selection: '1',
    odds: 1.85
  },
  ...
]
```

**Cách seed:**
```bash
# Chạy script seed
cd apps/backend
npm run seed:sports
```

---

### 4️⃣ **CHAT WIDGET** (Priority: LOW - Optional)

**Nếu muốn thêm:**

```tsx
// components/ChatWidget/ChatWidget.tsx (NEW FILE)
import React, { useState } from 'react';
import { FloatButton } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 80, backgroundColor: '#d0ad4a' }}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          width: 350,
          height: 500,
          backgroundColor: '#001529',
          border: '1px solid #d0ad4a',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999
        }}>
          <div style={{
            padding: 16,
            borderBottom: '1px solid #d0ad4a',
            color: '#fff'
          }}>
            Hỗ trợ khách hàng
          </div>
          <div style={{
            flex: 1,
            padding: 16,
            overflowY: 'auto',
            color: '#fff'
          }}>
            {/* Chat messages */}
          </div>
          <input
            type="text"
            placeholder="Gửi tin nhắn..."
            style={{
              padding: 12,
              borderTop: '1px solid #d0ad4a',
              backgroundColor: '#0d1f2f',
              color: '#fff',
              border: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
```

**Add to MainLayout:**
```tsx
<ChatWidget />
```

---

### 5️⃣ **FLOATING ACTIONS** (Priority: MEDIUM)

**Hiện tại:**
Đã có `FloatingActions` component nhưng cần verify hoạt động

**Check list:**
- [ ] Component hiển thị correctly
- [ ] Icons: Chat, Phone, Email, Live Chat
- [ ] Colors match gold theme
- [ ] Position: Bottom right
- [ ] Z-index không conflict

---

## 📝 DETAILED FIX CHECKLIST

### QUICK WINS (< 5 mins each):

- [ ] **Favicon**
  ```html
  <!-- public/index.html -->
  <link rel="icon" type="image/png" href="/assets/logo-pg88.png" />
  ```

- [ ] **Page Title**
  ```html
  <title>PG88 - Nhà Cái Hàng Đầu Châu Á</title>
  ```

- [ ] **OG Meta Tags**
  ```html
  <meta property="og:title" content="PG88 - Nhà Cái Online" />
  <meta property="og:image" content="/assets/logo-pg88.png" />
  ```

### MEDIUM EFFORT (15-30 mins):

- [ ] **Provider Logos**
  - [ ] Download/create 15 PNG files
  - [ ] Place in `/public/assets/providers/`
  - [ ] Test footer carousel

- [ ] **Logo Component**
  - [ ] Update Header.tsx
  - [ ] Update Footer.tsx
  - [ ] Add to MainLayout

### HIGHER EFFORT (30+ mins):

- [ ] **Sports Seeding**
  - [ ] Create sports.seed.ts
  - [ ] Create db migration
  - [ ] Seed data
  - [ ] Test API endpoints

- [ ] **Chat Widget**
  - [ ] Create component
  - [ ] Add to layout
  - [ ] Style matching
  - [ ] Test animations

---

## 🎨 ASSET URLS TO USE

### Official PG88 CDN:
```
https://img.ihudba.com/img/...

Banner images: ✅ Already using
Game images: ✅ Already using
Category images: ✅ Already using
Mid-banner images: ✅ Already using
Live casino logos: ✅ Already using
```

### Local Assets (Need to add):
```
/assets/logo-pg88.png (Need to find/download)
/assets/providers/
  ├── ae_lottery.png
  ├── ag.png
  ├── allbet.png
  ├── bbin.png
  ├── bng.png
  ├── cq9.png
  ├── dg.png
  ├── evo.png
  ├── jili.png
  ├── mg.png
  ├── pg.png
  ├── pp.png
  ├── saba.png
  ├── spadegaming.png
  └── wm.png
```

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1 (Do immediately - 10 mins):
1. ✅ Favicon + Meta tags
2. ✅ Logo update in Header

### Phase 2 (Next 30 mins):
1. ⚠️ Provider logos (if have files)
2. ⚠️ Sports seed data

### Phase 3 (Optional enhancements):
1. Chat widget
2. Advanced animations
3. Additional features

---

## ✅ TESTING CHECKLIST

After each fix, test:

```
[ ] HomePage loads correctly
[ ] All images display
[ ] Responsive on mobile (xs/sm/md/lg)
[ ] Colors match (#d0ad4a gold, #001529 dark)
[ ] Hover effects work
[ ] Carousel auto-plays
[ ] No console errors
[ ] API calls working
[ ] WebSocket connecting
[ ] Real-time updates
```

---

## 🎯 EXPECTED RESULTS

| Item | Before | After | Impact |
|------|--------|-------|--------|
| Match % | 97% | 100% | ✅ Production ready |
| Logo | Text | Image | ✅ Professional |
| Providers | Hidden | Visible | ✅ Better UX |
| Sports | Empty | Populated | ✅ Full feature set |
| Overall | 97/100 | 100/100 | ✅ Perfect match |

---

## 📞 SUPPORT RESOURCES

**If you need provider logos:**
- Search: "[Provider name] logo PNG"
- Sites: Google Images, Designer resources, GitHub repos
- Alternative: Generate placeholder if unavailable

**If you need sports data:**
- Use real sports data API or seed manually
- Example sports: Football, Tennis, Basketball
- Add 5-10 sample matches

**If issues with images:**
- Check console for 404 errors
- Verify file paths
- Use CDN fallback URLs

---

**Action Plan Created:** 2026-02-01
**Estimated Time to 100%:** 1-2 hours
**Difficulty:** EASY
**Status:** Ready to implement ✅
