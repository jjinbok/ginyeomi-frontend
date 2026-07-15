import AsyncStorage from '@react-native-async-storage/async-storage';
import { PARENT_RELATIONS } from '@/constants/parents';
import type { Anniversary, Parent } from '@/types';

const MAP_KEY = '@ginyeomi/anniversary-parents/v1';

type ParentMap = Record<string, number[]>;

async function readMap(): Promise<ParentMap> {
  const raw = await AsyncStorage.getItem(MAP_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as ParentMap;
}

async function writeMap(map: ParentMap): Promise<void> {
  await AsyncStorage.setItem(MAP_KEY, JSON.stringify(map));
}

export async function saveAnniversaryParents(
  anniversaryId: number,
  parentIds: number[],
): Promise<void> {
  const map = await readMap();
  map[String(anniversaryId)] = parentIds;
  await writeMap(map);
}

export async function loadAnniversaryParentMap(): Promise<Record<number, number[]>> {
  const map = await readMap();
  return Object.fromEntries(
    Object.entries(map).map(([id, parentIds]) => [Number(id), parentIds]),
  );
}

export async function removeAnniversaryParents(anniversaryId: number): Promise<void> {
  const map = await readMap();
  delete map[String(anniversaryId)];
  await writeMap(map);
}

function isBirthdayAnniversaryForParent(anniversary: Anniversary, parent: Parent): boolean {
  const expectedName = `${PARENT_RELATIONS[parent.relation].formalLabel} 생신`;
  if (anniversary.name !== expectedName) return false;
  const [, month, day] = parent.birthDate.split('-').map(Number);
  return anniversary.month === month && anniversary.day === day;
}

export function enrichAnniversariesWithParents(
  anniversaries: Anniversary[],
  parents: Parent[],
  parentMap: Record<number, number[]>,
): Anniversary[] {
  return anniversaries.map((anniversary) => {
    const mappedIds = parentMap[anniversary.id];
    if (mappedIds?.length) {
      return { ...anniversary, parentIds: mappedIds };
    }

    const birthdayParent = parents.find((p) => isBirthdayAnniversaryForParent(anniversary, p));
    if (birthdayParent) {
      return { ...anniversary, parentId: birthdayParent.id, parentIds: [birthdayParent.id] };
    }

    return anniversary;
  });
}

export function filterAnniversariesForParent(
  anniversaries: Anniversary[],
  parentId: number,
): Anniversary[] {
  return anniversaries.filter((anniversary) => {
    if (anniversary.parentId === parentId) return true;
    if (anniversary.parentIds?.includes(parentId)) return true;
    return false;
  });
}
