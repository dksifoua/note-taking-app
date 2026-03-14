import * as bcrypt from "bcrypt"
import { type SaveOptions, Schema } from "mongoose"

export interface IUser {
    email: string
    password: string
}

export const UserSchema = new Schema<IUser>(
    {
        email: { 
            type: String, 
            unique: true, 
            required: [true, "Email is required."], 
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
        },
        password: { 
            type: String, 
            required: [true, "Password is required."],
            minlength: [8, "Password must be at least 8 characters long."],
            maxlength: [128, "Password must be at most 128 characters long."],
            validate: [
                {
                    validator: (password: string): boolean => /[a-z]/.test(password),
                    message: "Password must contain at least one lowercase letter.",
                },
                {
                    validator: (password: string): boolean => /[A-Z]/.test(password),
                    message: "Password must contain at least one uppercase letter",
                },
                {
                    validator: (password: string): boolean => /\d/.test(password),
                    message: "Password must contain at least one digit.",
                },
                {
                    validator: (password: string): boolean => /[!@#$%^&*(),.?":{}|<>]/.test(password),
                    message: "Password must contain at least one special character.",
                },
            ]
        },
    },
    { timestamps: true }
).pre("save", async function (_: SaveOptions): Promise<void> {
    if (!this.isModified("password")) {
        return
    }
    this.password = await bcrypt.hash(this.password, 10)
})