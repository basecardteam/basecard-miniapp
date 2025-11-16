import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    serial,
    text,
    unique,
    varchar,
} from "drizzle-orm/pg-core";

// cards 테이블
export const cards = pgTable("cards", {
    id: serial("id").primaryKey(),
    nickname: varchar("nickname", { length: 256 }),
    bio: text("bio"),
    imageURI: text("imageURI"), // 생성된 BaseCard NFT 이미지 (IPFS URI)
    basename: text("basename"),
    role: text("role"),
    skills: text("skills").array(), // 스킬은 텍스트 배열로 저장
    address: varchar("address", { length: 42 }).unique(), // EVM 주소는 42자
    profileImage: text("profile_image"), // 카드 생성 시 사용한 원본 프로필 이미지 (SVG base64)
    tokenId: integer("token_id"), // NFT 민팅 시 생성된 tokenId (nullable)
});

// collections 테이블 (Many-to-Many 관계)
export const collections = pgTable(
    "collections",
    {
        id: serial("id").primaryKey(),
        cardId: integer("card_id")
            .notNull()
            .references(() => cards.id),
        collectedCardId: integer("collect_card_id")
            .notNull()
            .references(() => cards.id),
    },
    (table) => ({
        // 한 cardId가 같은 collectedCardId를 중복으로 수집할 수 없도록 unique 제약조건
        uniqueCollection: unique("unique_collection").on(
            table.cardId,
            table.collectedCardId
        ),
    })
);

// programs 테이블
export const programs = pgTable("programs", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"), // 마크다운 텍스트 저장
    ownerCardId: integer("owner_card_id")
        .notNull()
        .references(() => cards.id),
    type: varchar("type", { enum: ["bounty", "project"] }).notNull(),
});

// --- 테이블 간의 관계 정의 (ORM의 장점) ---

export const cardsRelations = relations(cards, ({ many }) => ({
    // 한 카드가 여러 개의 컬렉션을 가질 수 있음
    collections: many(collections, { relationName: "owner" }),
    // 한 카드가 여러 프로그램을 소유할 수 있음
    programs: many(programs),
}));

export const collectionsRelations = relations(collections, ({ one }) => ({
    // 컬렉션 항목은 소유자 카드와 수집된 카드 정보를 포함
    ownerCard: one(cards, {
        fields: [collections.cardId],
        references: [cards.id],
        relationName: "owner",
    }),
    collectedCard: one(cards, {
        fields: [collections.collectedCardId],
        references: [cards.id],
        relationName: "collected",
    }),
}));

export const programsRelations = relations(programs, ({ one }) => ({
    // 프로그램은 한 명의 소유자를 가짐
    owner: one(cards, {
        fields: [programs.ownerCardId],
        references: [cards.id],
    }),
}));
