// mess.js — shared mess score and tier, derived from object systems

export function createMess(ctx) {
  const Dishes = ctx.dishes;
  const Linens = ctx.linens;
  const Clothing = ctx.clothing;

  function score() {
    const dishScore = Math.min(5, Dishes.inSinkCount()) * 9;
    const bedScore = Linens.bedState() === 'messy' ? 15 : Linens.bedState() === 'unmade' ? 5 : 0;
    const towelScore = Linens.towelState() === 'on_floor' ? 8 : 0;
    const clothingBedScore = Clothing.itemsOnFloor('bedroom').length * 8;
    const clothingBathScore = Clothing.itemsOnFloor('bathroom').length * 5;
    return Math.min(100, dishScore + bedScore + towelScore + clothingBedScore + clothingBathScore);
  }

  function tier() {
    const s = score();
    if (s >= 70) return 'chaotic';
    if (s >= 45) return 'messy';
    if (s >= 20) return 'cluttered';
    return 'tidy';
  }

  return { score, tier };
}
