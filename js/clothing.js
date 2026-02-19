// clothing.js — coarse_v1 clothing tracking
// Tracks counts: floor items per location, dirty items, currently worn.
// Full granularity would track individual items with id, name, type, condition.
// See DESIGN-OBJECTS.md for the interface contract.

export function createClothing(ctx) {
  // Coarse state — counts only, no item identity.
  let _floor_bedroom = 0;   // items on bedroom floor
  let _floor_bathroom = 0;  // items on bathroom floor
  let _in_basket = 0;       // dirty items in laundry basket (not on floor)
  let _worn = 0;            // items currently on body
  let _total = 12;          // total wardrobe size (set at reset)

  // Wearable = items not on floor, not in basket, not currently worn.
  function _wearableCount() {
    return _total - _floor_bedroom - _floor_bathroom - _in_basket - _worn;
  }

  // --- Queries ---

  /**
   * Items on floor in the given location. Coarse: returns generic placeholder objects.
   * @param {'bedroom' | 'bathroom'} location
   * @returns {{ name: string }[]}
   */
  function itemsOnFloor(location) {
    const count = location === 'bedroom' ? _floor_bedroom : _floor_bathroom;
    // Synthesize generic names for the coarse implementation.
    const genericNames = ['a shirt', 'a pair of jeans', 'a hoodie', 'some clothes', 'yesterday\'s outfit'];
    return Array.from({ length: count }, (_, i) => ({ name: genericNames[i % genericNames.length] }));
  }

  /** Items that can be put on right now. */
  function wearableItems() {
    const count = _wearableCount();
    return Array.from({ length: Math.max(0, count) }, () => ({ name: 'clothing' }));
  }

  /**
   * Can the character get dressed? True if there are wearable items.
   * Low-wearable scenarios still allow dressing (you make do).
   */
  function canGetDressed() {
    return _wearableCount() > 0 || _floor_bedroom > 0 || _floor_bathroom > 0;
  }

  /** Total dirty items (floor + basket). */
  function dirtyCount() {
    return _floor_bedroom + _floor_bathroom + _in_basket;
  }

  /**
   * A prose fragment describing clothes on the floor of a location.
   * Returns '' if the floor is clear.
   * @param {'bedroom' | 'bathroom'} location
   * @returns {string}
   */
  function floorDescription(location) {
    const count = location === 'bedroom' ? _floor_bedroom : _floor_bathroom;
    if (count === 0) return '';
    if (count === 1) return 'Something on the floor.';
    if (count === 2) return 'A couple of things on the floor.';
    if (count <= 4) return 'Clothes on the floor — things from the last few days.';
    return 'The floor is its own wardrobe at this point.';
  }

  // --- Mutations ---

  /**
   * Getting dressed — marks items as worn.
   * Uses accessible/stored items if available; falls back to floor items.
   */
  function wear() {
    if (_wearableCount() > 0) {
      _worn++;
    } else if (_floor_bedroom > 0) {
      // Grabbing something off the floor
      _floor_bedroom--;
      _worn++;
    }
  }

  /**
   * Undressing — happens at sleep time. Destination depends on energy/mood.
   * @param {'exhausted' | 'tired' | 'okay' | 'rested' | string} energyTier
   * @param {'numb' | 'heavy' | 'quiet' | 'clear' | string} moodTone
   * @param {'bedroom' | 'bathroom' | string} location
   */
  function undress(energyTier, moodTone, location) {
    if (_worn === 0) return;

    // Low energy or bad mood: clothes go on the floor. Otherwise: basket.
    const dropToFloor = energyTier === 'depleted' || energyTier === 'exhausted'
      || moodTone === 'numb' || moodTone === 'heavy';

    if (dropToFloor) {
      if (location === 'bathroom') {
        _floor_bathroom += _worn;
      } else {
        _floor_bedroom += _worn;
      }
    } else {
      _in_basket += _worn;
    }
    _worn = 0;
  }

  /**
   * Move floor items to the laundry basket — a tidying action.
   * @param {'bedroom' | 'bathroom' | 'both'} [location='both']
   */
  function moveToBasket(location) {
    const loc = location ?? 'both';
    if (loc === 'bedroom' || loc === 'both') {
      _in_basket += _floor_bedroom;
      _floor_bedroom = 0;
    }
    if (loc === 'bathroom' || loc === 'both') {
      _in_basket += _floor_bathroom;
      _floor_bathroom = 0;
    }
  }

  /** Wash all dirty items — they return to the wearable pool. */
  function wash() {
    _in_basket = 0;
    _floor_bedroom = 0;
    _floor_bathroom = 0;
  }

  // --- Lifecycle ---

  /** Reset to initial state. Called at the start of each replay. */
  function reset() {
    _total = 12;
    _floor_bedroom = 0;
    _floor_bathroom = 0;
    _in_basket = 0;
    _worn = 0;
  }

  // --- Serialization ---

  function serialize() {
    return {
      floor_bedroom: _floor_bedroom,
      floor_bathroom: _floor_bathroom,
      in_basket: _in_basket,
      worn: _worn,
      total: _total,
    };
  }

  function deserialize(data) {
    _floor_bedroom = data.floor_bedroom ?? 0;
    _floor_bathroom = data.floor_bathroom ?? 0;
    _in_basket = data.in_basket ?? 0;
    _worn = data.worn ?? 0;
    _total = data.total ?? 12;
  }

  return {
    itemsOnFloor,
    wearableItems,
    canGetDressed,
    dirtyCount,
    floorDescription,
    wear,
    undress,
    moveToBasket,
    wash,
    reset,
    serialize,
    deserialize,
  };
}
