
## Visual Gap Analysis (Current vs Screenshot)

### Header
- **Missing Top Bar**: The screenshot shows a thin red/dark bar at the very top with links (Giới thiệu, Hot, Nổ Hũ, etc.) and "Tải App".
- **Logo Position**: Matches generally.
- **Login/Register**: Matches buttons, but styling could be sharper.

### Homepage
1.  **Quick Nav (Icon Menu)**:
    -   *Current*: CSS Gradient Blocks with Emoji/Icons.
    -   *Target*: Square image cards (Panda, Girl, etc.) with gold borders and text overlay.
    -   *Action*: Need to replace CSS blocks with Image-based buttons (using scraped assets `casino/title-*` or similar).

2.  **Featured Promo Section** (Zone between Banner and Hot Games):
    -   *Current*: Missing.
    -   *Target*: 3 Large Cards with Characters (Girls/Players) and "Chơi Ngay" red buttons.
    -   *Action*: Implement `PromotionSection` component.

3.  **Hot Games**:
    -   *Current*: Simple Card Grid.
    -   *Target*: The screenshot shows a vibrant list. We have the assets, but the container styling needs to match the "White/Light" glow or specific background if applicable.

4.  **Live Casino**:
    -   *Current*: Implemented.
    -   *Target*: Matches well enough for now.

## Plan Adjustment
We will proceed to **Phase 4 (Member Center)** as requested, but we should slot in the **Header & Promo Section** fixes as "UI Polish" tasks.
