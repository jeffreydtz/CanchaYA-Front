"use server"

import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock validation
  if (email === "admin@canchaya.com" && password === "admin123") {
    redirect("/admin")
  } else if (email && password) {
    redirect("/")
  } else {
    throw new Error("Invalid credentials")
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock registration
  console.log("Registering user:", { email, name, phone })

  redirect("/login")
}

export async function reserveCourtAction(formData: FormData) {
  const courtId = formData.get("courtId") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log("Reserving court:", { courtId, date, time })

  return { success: true, reservationId: Math.random().toString(36).substr(2, 9) }
}

export async function confirmAttendanceAction(reservationId: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log("Confirming attendance for reservation:", reservationId)

  return { success: true }
}
