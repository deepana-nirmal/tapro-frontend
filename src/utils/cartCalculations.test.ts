import { cartItemCount, cartSubtotal, clampQuantity, sameTableContext } from './cartCalculations';

describe('cartCalculations', () => {
  it('clamps quantities into the supported cart range', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(2.8)).toBe(2);
    expect(clampQuantity(150)).toBe(99);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });

  it('calculates cart totals from line prices and quantities', () => {
    const cart = [
      { price: 1200, quantity: 2 },
      { price: 450, quantity: 3 },
    ];

    expect(cartSubtotal(cart)).toBe(3750);
    expect(cartItemCount(cart)).toBe(5);
  });

  it('compares restaurant and table context', () => {
    expect(sameTableContext(
      { restaurantId: 1, tableId: 2, tableNumber: 'A1' },
      { restaurantId: 1, tableId: 2, tableNumber: 'A1' }
    )).toBe(true);
    expect(sameTableContext(
      { restaurantId: 1, tableId: 2, tableNumber: 'A1' },
      { restaurantId: 1, tableId: 3, tableNumber: 'A2' }
    )).toBe(false);
  });
});

