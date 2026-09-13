/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import {SignInDataset} from "@sentients/sdk/infrastructure/dataset/sign-in.dataset";
import {SignUpDataset} from "@sentients/sdk/infrastructure/dataset/sign-up.dataset";

describe('Dataset Validation System', () => {
  describe('SignInDataset', () => {
    it('should validate required identifier field', () => {
      const { result } = renderHook(() => SignInDataset())
      const validation = result.current.validate()
      expect(validation.valid).toBe(false)
      expect(validation.errors.identifier).toBeDefined()
    })

    it('should pass validation with valid data', () => {
      const { result } = renderHook(() => SignInDataset())
      result.current.setter('identifier', 'test@example.com')
      result.current.setter('password', 'password123')
      const validation = result.current.validate()
      expect(validation.valid).toBe(true)
      expect(validation.errors).toEqual({})
    })
  })

  describe('SignUpDataset', () => {
    it('should validate all required fields', () => {
      const { result } = renderHook(() => SignUpDataset())
      const validation = result.current.validate()
      expect(validation.valid).toBe(false)
      expect(validation.errors.first_names).toBeDefined()
      expect(validation.errors.last_name).toBeDefined()
      expect(validation.errors.email).toBeDefined()
      expect(validation.errors.password).toBeDefined()
      expect(validation.errors.username).toBeDefined()
      expect(validation.errors.phone).toBeDefined()
    })

    it('should pass validation with all valid data', () => {
      const { result } = renderHook(() => SignUpDataset())
      result.current.setter('first_names', 'John')
      result.current.setter('last_name', 'Doe')
      result.current.setter('username', 'johndoe')
      result.current.setter('email', 'john@example.com')
      result.current.setter('phone', '0612345678')
      result.current.setter('organization', 'Test Org')
      result.current.setter('otp', '123456')
      result.current.setter('password', 'password123')
      result.current.setter('password_confirmation', 'password123')
      const validation = result.current.validate()
      expect(validation.valid).toBe(true)
    })
  })
})
