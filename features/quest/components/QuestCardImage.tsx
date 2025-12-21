import Image from "next/image";

export default function QuestCardImage() {
    return (
        <div className="relative w-[171px] h-[115px]">
            <Image
                src="/assets/quest-card.svg"
                alt="Quest Card"
                fill
                className="object-contain"
            />
        </div>
    );
}
