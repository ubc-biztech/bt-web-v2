import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import React, { useState } from 'react'


interface SelectCellProps {
    originalValue: string | number,
    dropDownList: string[]
}

const SelectCell: React.FC<SelectCellProps> = ({ originalValue, dropDownList }) => {
    const [value, setValue] = useState(originalValue)

    const onSelectChange = (newValue: string) => {
        setValue(newValue)
        console.log("TODO - update data")
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };


    return (
        <div>
            {dropDownList ? (
                <Select onValueChange={onSelectChange} defaultValue="Not Found">
                    <SelectTrigger className="p3 rounded-none bg-events-active-tab-bg text-white p-0 border-0 border-b-2 border-b-baby-blue">
                        <SelectValue>
                            {value}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className='focus:border-0 bg-white'>
                        <SelectGroup>
                            {/* Use the key to access the correct dropDownList */}
                            {dropDownList.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    className="p3 rounded-none bg-events-active-tab-bg text-white p-0 border-0 border-b-2 border-b-baby-blue"
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                />
            )}
        </div>
    );
}

export default SelectCell;

