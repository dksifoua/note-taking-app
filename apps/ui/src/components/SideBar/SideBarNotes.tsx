import { type JSX } from "react"
import { Button } from "../Button"
import { PlusIcon } from "../icons"
import React from "react"

const notes = [
    {
        title: "React Performance Optimization",
        tags: ["Dev", "React"],
        date: "29 Oct 2024",
        selected: true
    },
    {
        title: "Japan Travel Planning",
        tags: ["Travel", "Japan", "Personal"],
        date: "28 Oct 2024",
        selected: false
    },
    {
        title: "Favorite Pasta Recipes",
        tags: ["Cooking", "Recipes"],
        date: "27 Oct 2024",
        selected: false
    },
    {
        title: "TypeScript Migration Guide",
        tags: ["Dev", "React", "TypeScript"],
        date: "26 Oct 2024",
        selected: false
    }
]

export function SideBarNotes(): JSX.Element {

    return (
        <div className="w-73 h-screen flex flex-col gap-y-4 pl-8 pr-4 py-5 border-r border-r-neutral-200">
            <Button variant="primary">
                <Button.Icon>
                    <PlusIcon className="size-6"/>
                </Button.Icon>
                <Button.Text>
                    Create New Note
                </Button.Text>
            </Button>
            <div className="flex flex-col gap-y-1 overflow-y-auto">
                {
                    notes.map((note, noteIndex) => {
                        const { title, tags, date, selected } = note

                        return (
                            <React.Fragment key={noteIndex}>
                                <div className={`flex flex-col gap-y-3 p-2 rounded-6 ${
                                    selected ? 'bg-neutral-100' : ''
                                }`}>
                                    <p className="text-preset-3 text-neutral-950">{title}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {
                                            tags.map((tag, tagIndex) => (
                                                <p key={tagIndex}
                                                   className="px-1.5 py-0.5 rounded-4 bg-neutral-200">{tag}</p>
                                            ))
                                        }
                                    </div>
                                    <p className="text-preset-6 text-neutral-700">{date}</p>
                                </div>
                                {
                                    !selected && noteIndex < notes.length 
                                    && <div className="w-full border border-neutral-200"/>
                                }
                            </React.Fragment>
                        )
                    })
                }
            </div>
        </div>
    )
}