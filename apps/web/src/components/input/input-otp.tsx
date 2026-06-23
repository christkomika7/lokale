import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP as Input,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";

interface InputOTPProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  isInvalid?: "true" | "false";
  disable?: boolean;
}

export default function InputOTP({
  value,
  onChange,
  onComplete,
  isInvalid = "false",
  disable = false,
}: InputOTPProps) {
  return (
    <div>
      <Input
        maxLength={6}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        pattern={REGEXP_ONLY_DIGITS}
        disabled={disable}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} aria-invalid={isInvalid} />
          <InputOTPSlot index={1} aria-invalid={isInvalid} />
          <InputOTPSlot index={2} aria-invalid={isInvalid} />
          <InputOTPSlot index={3} aria-invalid={isInvalid} />
          <InputOTPSlot index={4} aria-invalid={isInvalid} />
          <InputOTPSlot index={5} aria-invalid={isInvalid} />
        </InputOTPGroup>
      </Input>
    </div>
  );
}
