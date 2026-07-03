import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  OrganizerEvent,
  Applicant,
  ApplicantStatus,
  AttendanceRecord,
  CommunicationLogEntry,
  EventRequirement,
} from '../types/organizer'
import { mockAttendanceRecords, mockCommunicationLogs } from '../data/mockOrganizer'
import type { CloseEventResult } from '../components/organizer/CloseEventWizard'
import {
  createEventRequest,
  listMyEventsRequest,
  addRoleRequest,
  addRequirementRequest,
  closeEventRequest,
  listApplicantsRequest,
  updateApplicantStatusRequest,
  addApplicantNoteRequest,
  assignApplicantRequest,
  type CreateEventPayload,
  type CreateEventRolePayload,
} from '../lib/organizerApi'

interface OrganizerDataContextValue {
  isLoading: boolean
  events: OrganizerEvent[]
  applicants: Applicant[]
  attendanceRecords: AttendanceRecord[]
  communicationLogs: CommunicationLogEntry[]
  requirements: EventRequirement[]
  addEvent: (payload: CreateEventPayload) => Promise<void>
  addRole: (eventId: string, role: CreateEventRolePayload) => Promise<void>
  updateApplicantStatus: (applicantId: string, status: ApplicantStatus) => Promise<void>
  addApplicantNote: (applicantId: string, note: string) => Promise<void>
  assignApplicant: (applicantId: string, roleId: string, shiftId: string) => Promise<void>
  addCommunicationLog: (log: CommunicationLogEntry) => void
  addRequirement: (eventId: string, requirement: { title: string; type: EventRequirement['type']; isMandatory: boolean }) => Promise<void>
  checkInAttendance: (attendanceId: string, method: 'qr' | 'manual') => void
  markNoShow: (attendanceId: string) => void
  closeEvent: (eventId: string, result: CloseEventResult) => Promise<void>
}

const OrganizerDataContext = createContext<OrganizerDataContextValue | null>(null)

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.'
  window.alert(message)
}

export function OrganizerDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords)
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>(mockCommunicationLogs)

  const requirements = events.flatMap((e) => e.requirements)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const myEvents = await listMyEventsRequest()
        if (cancelled) return
        setEvents(myEvents)

        const applicantLists = await Promise.all(
          myEvents.map((event) => listApplicantsRequest(event.id).catch(() => [])),
        )
        if (cancelled) return
        setApplicants(applicantLists.flat())
      } catch (err) {
        if (!cancelled) reportError(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const addEvent = async (payload: CreateEventPayload) => {
    try {
      const event = await createEventRequest(payload)
      setEvents((prev) => [event, ...prev])
    } catch (err) {
      reportError(err)
    }
  }

  const addRole = async (eventId: string, role: CreateEventRolePayload) => {
    try {
      const newRole = await addRoleRequest(eventId, role)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, roles: [...e.roles, newRole] } : e)))
    } catch (err) {
      reportError(err)
    }
  }

  const updateApplicantStatus = async (applicantId: string, status: ApplicantStatus) => {
    try {
      const updated = await updateApplicantStatusRequest(applicantId, status)
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated : a)))
    } catch (err) {
      reportError(err)
    }
  }

  const addApplicantNote = async (applicantId: string, note: string) => {
    try {
      const updated = await addApplicantNoteRequest(applicantId, note)
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated : a)))
    } catch (err) {
      reportError(err)
    }
  }

  const assignApplicant = async (applicantId: string, roleId: string, shiftId: string) => {
    try {
      const updated = await assignApplicantRequest(applicantId, roleId, shiftId)
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated : a)))
    } catch (err) {
      reportError(err)
    }
  }

  const addCommunicationLog = (log: CommunicationLogEntry) => setCommunicationLogs((prev) => [log, ...prev])

  const addRequirement = async (
    eventId: string,
    requirement: { title: string; type: EventRequirement['type']; isMandatory: boolean },
  ) => {
    try {
      const newRequirement = await addRequirementRequest(eventId, requirement)
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, requirements: [...e.requirements, newRequirement] } : e)),
      )
    } catch (err) {
      reportError(err)
    }
  }

  const checkInAttendance = (attendanceId: string, method: 'qr' | 'manual') => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === attendanceId ? { ...r, status: 'checked_in', checkedInAt: new Date().toISOString(), method } : r,
      ),
    )
  }

  const markNoShow = (attendanceId: string) => {
    setAttendanceRecords((prev) => prev.map((r) => (r.id === attendanceId ? { ...r, status: 'no_show' } : r)))
  }

  const closeEvent = async (eventId: string, result: CloseEventResult) => {
    try {
      const updatedEvent = await closeEventRequest(eventId, { finalStatuses: result.finalStatuses, impactValue: result.impactValue })
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)))
      setApplicants((prev) =>
        prev.map((a) => (result.finalStatuses[a.id] ? { ...a, status: result.finalStatuses[a.id] } : a)),
      )
    } catch (err) {
      reportError(err)
    }
  }

  return (
    <OrganizerDataContext.Provider
      value={{
        isLoading,
        events,
        applicants,
        attendanceRecords,
        communicationLogs,
        requirements,
        addEvent,
        addRole,
        updateApplicantStatus,
        addApplicantNote,
        assignApplicant,
        addCommunicationLog,
        addRequirement,
        checkInAttendance,
        markNoShow,
        closeEvent,
      }}
    >
      {children}
    </OrganizerDataContext.Provider>
  )
}

export function useOrganizerData() {
  const ctx = useContext(OrganizerDataContext)
  if (!ctx) {
    throw new Error('useOrganizerData must be used within an OrganizerDataProvider')
  }
  return ctx
}
