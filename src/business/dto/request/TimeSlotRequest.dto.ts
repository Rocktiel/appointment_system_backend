import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { DtoField, getValidationMessage, ValidationMessage } from "src/_common/enums/ValidationMessages.enum";

export class TimeSlotRequestDto {

    @ApiProperty()
    @IsNotEmpty({ message: getValidationMessage(DtoField.BUSINESS, ValidationMessage.IS_NOT_EMPTY) })
    businessId: number;

    @ApiProperty()
    @IsNotEmpty({ message: getValidationMessage(DtoField.DAY, ValidationMessage.IS_NOT_EMPTY) })
    dayId: number;

    @ApiProperty({ example: "09:00" })
    @IsNotEmpty({ message: getValidationMessage(DtoField.START_TIME, ValidationMessage.IS_NOT_EMPTY) })
    startTime: string;

    @ApiProperty({ example: "17:00" })
    @IsNotEmpty({ message: getValidationMessage(DtoField.END_TIME, ValidationMessage.IS_NOT_EMPTY) })
    endTime: string;
    
}