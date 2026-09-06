import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendThreadPlaces, threadsSnapshot } from '../lib/threads-places.mjs';

test('resolves the Seoul venue without treating a keyword hit as a Hanam address', () => {
  const result = recommendThreadPlaces();
  assert.equal(result.length, 20);
  const original = ['arisu', 'children-grand-park', 'seoul-children-museum', 'olympic-park', 'gildong-eco', 'songpa-book', 'hanam-tree', 'seodaemun-natural-history'];
  assert.ok(original.every(id => result.some(place => place.id === id)));
  const firstOtherArea = result.findIndex(place => !place.nearby);
  assert.ok(result.slice(firstOtherArea).every(place => !place.nearby));
  assert.deepEqual(recommendThreadPlaces(threadsSnapshot, { areas: ['hanam'] }).map(place => place.id).sort(), ['hanam-tree', 'misa-library', 'starfield-hanam']);
  assert.ok(!result.some(place => place.id === 'hwapo-wetland'));
});

test('unverified places and unsafe verification links cannot enter recommendations', () => {
  const copy = structuredClone(threadsSnapshot);
  copy.venues = copy.venues.filter(place => place.id === 'seodaemun-natural-history');
  copy.venues[0].verified = false;
  assert.deepEqual(recommendThreadPlaces(copy), []);
  copy.venues[0].verified = true;
  copy.venues[0].source = 'https://example.com/fake';
  assert.deepEqual(recommendThreadPlaces(copy), []);
});

test('one source can support multiple venues, but duplicate venue IDs appear once', () => {
  const copy = structuredClone(threadsSnapshot);
  copy.venues.push({ ...copy.venues.find(place => place.id === 'olympic-park') });
  const result = recommendThreadPlaces(copy);
  assert.equal(result.filter(place => place.post.id === 'DTtZ-snEuRs').length, 9);
  assert.equal(new Set(result.map(place => place.id)).size, result.length);
  assert.ok(result.every(place => place.kind && place.evidenceType && place.post.timestamp));
});
