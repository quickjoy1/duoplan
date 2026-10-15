import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityList, AuthSession, CalendarEvent, CalendarEventInput, CalendarEventList, CalendarEventUpdate, Chapter, ChapterInput, ChapterList, ChapterUpdate, Dashboard, FocusSession, FocusSessionInput, FocusSessionList, FocusSessionUpdate, GetDashboardParams, Goal, GoalInput, GoalList, GoalUpdate, Habit, HabitCheckInInput, HabitInput, HabitList, HabitUpdate, HealthStatus, JournalEntry, JournalEntryInput, JournalEntryList, JournalEntryUpdate, ListCalendarEventsParams, ListChaptersParams, ListFocusSessionsParams, ListNotificationsParams, ListTasksParams, Notification, NotificationList, ProfileSelectionInput, Subject, SubjectInput, SubjectList, SubjectUpdate, Task, TaskInput, TaskList, TaskUpdate, WorkspaceExport, WorkspaceLoginInput, WorkspacePasswordChangeInput, WorkspaceSettings, WorkspaceSettingsUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAuthSessionUrl: () => string;
/**
 * @summary Check the current workspace session
 */
export declare const getAuthSession: (options?: Parameters<typeof customFetch>[1]) => Promise<AuthSession>;
export declare const getGetAuthSessionQueryKey: () => readonly ["/api/auth/session"];
export declare const getGetAuthSessionQueryOptions: <TData = Awaited<ReturnType<typeof getAuthSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAuthSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAuthSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAuthSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;
export type GetAuthSessionQueryError = ErrorType<unknown>;
/**
 * @summary Check the current workspace session
 */
export declare function useGetAuthSession<TData = Awaited<ReturnType<typeof getAuthSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAuthSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginToWorkspaceUrl: () => string;
/**
 * @summary Validate the shared workspace password
 */
export declare const loginToWorkspace: (workspaceLoginInput: WorkspaceLoginInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthSession>;
export declare const getLoginToWorkspaceMutationKey: () => readonly ["loginToWorkspace"];
export declare const getLoginToWorkspaceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginToWorkspace>>, TError, LoginToWorkspaceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof loginToWorkspace>>, TError, LoginToWorkspaceMutationVariables, TContext>;
export type LoginToWorkspaceMutationResult = NonNullable<Awaited<ReturnType<typeof loginToWorkspace>>>;
export type LoginToWorkspaceMutationBody = BodyType<WorkspaceLoginInput>;
export type LoginToWorkspaceMutationError = ErrorType<void>;
export type LoginToWorkspaceMutationVariables = {
    data: BodyType<WorkspaceLoginInput>;
};
/**
* @summary Validate the shared workspace password
*/
export declare const useLoginToWorkspace: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginToWorkspace>>, TError, LoginToWorkspaceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof loginToWorkspace>>, TError, LoginToWorkspaceMutationVariables, TContext>;
export declare const getLogoutOfWorkspaceUrl: () => string;
/**
 * @summary Revoke the current session
 */
export declare const logoutOfWorkspace: (options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getLogoutOfWorkspaceMutationKey: () => readonly ["logoutOfWorkspace"];
export declare const getLogoutOfWorkspaceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutOfWorkspace>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutOfWorkspace>>, TError, void, TContext>;
export type LogoutOfWorkspaceMutationResult = NonNullable<Awaited<ReturnType<typeof logoutOfWorkspace>>>;
export type LogoutOfWorkspaceMutationError = ErrorType<unknown>;
/**
* @summary Revoke the current session
*/
export declare const useLogoutOfWorkspace: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutOfWorkspace>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutOfWorkspace>>, TError, void, TContext>;
export declare const getChangeWorkspacePasswordUrl: () => string;
/**
 * @summary Change the shared workspace password
 */
export declare const changeWorkspacePassword: (workspacePasswordChangeInput: WorkspacePasswordChangeInput, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getChangeWorkspacePasswordMutationKey: () => readonly ["changeWorkspacePassword"];
export declare const getChangeWorkspacePasswordMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeWorkspacePassword>>, TError, ChangeWorkspacePasswordMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof changeWorkspacePassword>>, TError, ChangeWorkspacePasswordMutationVariables, TContext>;
export type ChangeWorkspacePasswordMutationResult = NonNullable<Awaited<ReturnType<typeof changeWorkspacePassword>>>;
export type ChangeWorkspacePasswordMutationBody = BodyType<WorkspacePasswordChangeInput>;
export type ChangeWorkspacePasswordMutationError = ErrorType<unknown>;
export type ChangeWorkspacePasswordMutationVariables = {
    data: BodyType<WorkspacePasswordChangeInput>;
};
/**
* @summary Change the shared workspace password
*/
export declare const useChangeWorkspacePassword: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeWorkspacePassword>>, TError, ChangeWorkspacePasswordMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof changeWorkspacePassword>>, TError, ChangeWorkspacePasswordMutationVariables, TContext>;
export declare const getRevokeWorkspaceSessionsUrl: () => string;
/**
 * @summary Revoke every active workspace session
 */
export declare const revokeWorkspaceSessions: (options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getRevokeWorkspaceSessionsMutationKey: () => readonly ["revokeWorkspaceSessions"];
export declare const getRevokeWorkspaceSessionsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof revokeWorkspaceSessions>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof revokeWorkspaceSessions>>, TError, void, TContext>;
export type RevokeWorkspaceSessionsMutationResult = NonNullable<Awaited<ReturnType<typeof revokeWorkspaceSessions>>>;
export type RevokeWorkspaceSessionsMutationError = ErrorType<unknown>;
/**
* @summary Revoke every active workspace session
*/
export declare const useRevokeWorkspaceSessions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof revokeWorkspaceSessions>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof revokeWorkspaceSessions>>, TError, void, TContext>;
export declare const getSelectProfileUrl: () => string;
/**
 * @summary Select the active convenience profile
 */
export declare const selectProfile: (profileSelectionInput: ProfileSelectionInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthSession>;
export declare const getSelectProfileMutationKey: () => readonly ["selectProfile"];
export declare const getSelectProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof selectProfile>>, TError, SelectProfileMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof selectProfile>>, TError, SelectProfileMutationVariables, TContext>;
export type SelectProfileMutationResult = NonNullable<Awaited<ReturnType<typeof selectProfile>>>;
export type SelectProfileMutationBody = BodyType<ProfileSelectionInput>;
export type SelectProfileMutationError = ErrorType<unknown>;
export type SelectProfileMutationVariables = {
    data: BodyType<ProfileSelectionInput>;
};
/**
* @summary Select the active convenience profile
*/
export declare const useSelectProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof selectProfile>>, TError, SelectProfileMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof selectProfile>>, TError, SelectProfileMutationVariables, TContext>;
export declare const getGetDashboardUrl: (params?: GetDashboardParams) => string;
/**
 * @summary Get dashboard data and workload overview
 */
export declare const getDashboard: (params?: GetDashboardParams, options?: Parameters<typeof customFetch>[1]) => Promise<Dashboard>;
export declare const getGetDashboardQueryKey: (params?: GetDashboardParams) => readonly ["/api/workspace/dashboard", ...GetDashboardParams[]];
export declare const getGetDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getDashboard>>, TError = ErrorType<unknown>>(params?: GetDashboardParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;
export type GetDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard data and workload overview
 */
export declare function useGetDashboard<TData = Awaited<ReturnType<typeof getDashboard>>, TError = ErrorType<unknown>>(params?: GetDashboardParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWorkspaceSettingsUrl: () => string;
/**
 * @summary Read workspace settings and profiles
 */
export declare const getWorkspaceSettings: (options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceSettings>;
export declare const getGetWorkspaceSettingsQueryKey: () => readonly ["/api/workspace/settings"];
export declare const getGetWorkspaceSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getWorkspaceSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWorkspaceSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWorkspaceSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWorkspaceSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getWorkspaceSettings>>>;
export type GetWorkspaceSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Read workspace settings and profiles
 */
export declare function useGetWorkspaceSettings<TData = Awaited<ReturnType<typeof getWorkspaceSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWorkspaceSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getExportWorkspaceDataUrl: () => string;
/**
 * @summary Download the authorized workspace data as JSON
 */
export declare const exportWorkspaceData: (options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceExport>;
export declare const getExportWorkspaceDataQueryKey: () => readonly ["/api/workspace/export"];
export declare const getExportWorkspaceDataQueryOptions: <TData = Awaited<ReturnType<typeof exportWorkspaceData>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportWorkspaceData>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof exportWorkspaceData>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ExportWorkspaceDataQueryResult = NonNullable<Awaited<ReturnType<typeof exportWorkspaceData>>>;
export type ExportWorkspaceDataQueryError = ErrorType<unknown>;
/**
 * @summary Download the authorized workspace data as JSON
 */
export declare function useExportWorkspaceData<TData = Awaited<ReturnType<typeof exportWorkspaceData>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportWorkspaceData>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateWorkspaceSettingsUrl: () => string;
/**
 * @summary Update workspace settings or profile details
 */
export declare const updateWorkspaceSettings: (workspaceSettingsUpdate: WorkspaceSettingsUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceSettings>;
export declare const getUpdateWorkspaceSettingsMutationKey: () => readonly ["updateWorkspaceSettings"];
export declare const getUpdateWorkspaceSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkspaceSettings>>, TError, UpdateWorkspaceSettingsMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateWorkspaceSettings>>, TError, UpdateWorkspaceSettingsMutationVariables, TContext>;
export type UpdateWorkspaceSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateWorkspaceSettings>>>;
export type UpdateWorkspaceSettingsMutationBody = BodyType<WorkspaceSettingsUpdate>;
export type UpdateWorkspaceSettingsMutationError = ErrorType<unknown>;
export type UpdateWorkspaceSettingsMutationVariables = {
    data: BodyType<WorkspaceSettingsUpdate>;
};
/**
* @summary Update workspace settings or profile details
*/
export declare const useUpdateWorkspaceSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkspaceSettings>>, TError, UpdateWorkspaceSettingsMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateWorkspaceSettings>>, TError, UpdateWorkspaceSettingsMutationVariables, TContext>;
export declare const getListTasksUrl: (params?: ListTasksParams) => string;
/**
 * @summary Search and filter shared tasks
 */
export declare const listTasks: (params?: ListTasksParams, options?: Parameters<typeof customFetch>[1]) => Promise<TaskList>;
export declare const getListTasksQueryKey: (params?: ListTasksParams) => readonly ["/api/tasks", ...ListTasksParams[]];
export declare const getListTasksQueryOptions: <TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listTasks>>>;
export type ListTasksQueryError = ErrorType<unknown>;
/**
 * @summary Search and filter shared tasks
 */
export declare function useListTasks<TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTaskUrl: () => string;
/**
 * @summary Create a shared task
 */
export declare const createTask: (taskInput: TaskInput, options?: Parameters<typeof customFetch>[1]) => Promise<Task>;
export declare const getCreateTaskMutationKey: () => readonly ["createTask"];
export declare const getCreateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, CreateTaskMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, CreateTaskMutationVariables, TContext>;
export type CreateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof createTask>>>;
export type CreateTaskMutationBody = BodyType<TaskInput>;
export type CreateTaskMutationError = ErrorType<unknown>;
export type CreateTaskMutationVariables = {
    data: BodyType<TaskInput>;
};
/**
* @summary Create a shared task
*/
export declare const useCreateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, CreateTaskMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTask>>, TError, CreateTaskMutationVariables, TContext>;
export declare const getUpdateTaskUrl: (taskId: string) => string;
/**
 * @summary Update or reschedule a task
 */
export declare const updateTask: (taskId: string, taskUpdate: TaskUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Task>;
export declare const getUpdateTaskMutationKey: () => readonly ["updateTask"];
export declare const getUpdateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, UpdateTaskMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, UpdateTaskMutationVariables, TContext>;
export type UpdateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof updateTask>>>;
export type UpdateTaskMutationBody = BodyType<TaskUpdate>;
export type UpdateTaskMutationError = ErrorType<unknown>;
export type UpdateTaskMutationVariables = {
    taskId: string;
    data: BodyType<TaskUpdate>;
};
/**
* @summary Update or reschedule a task
*/
export declare const useUpdateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, UpdateTaskMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTask>>, TError, UpdateTaskMutationVariables, TContext>;
export declare const getDeleteTaskUrl: (taskId: string) => string;
/**
 * @summary Delete a task
 */
export declare const deleteTask: (taskId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteTaskMutationKey: () => readonly ["deleteTask"];
export declare const getDeleteTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, DeleteTaskMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, DeleteTaskMutationVariables, TContext>;
export type DeleteTaskMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTask>>>;
export type DeleteTaskMutationError = ErrorType<unknown>;
export type DeleteTaskMutationVariables = {
    taskId: string;
};
/**
* @summary Delete a task
*/
export declare const useDeleteTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, DeleteTaskMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTask>>, TError, DeleteTaskMutationVariables, TContext>;
export declare const getListCalendarEventsUrl: (params?: ListCalendarEventsParams) => string;
/**
 * @summary List events in a date range
 */
export declare const listCalendarEvents: (params?: ListCalendarEventsParams, options?: Parameters<typeof customFetch>[1]) => Promise<CalendarEventList>;
export declare const getListCalendarEventsQueryKey: (params?: ListCalendarEventsParams) => readonly ["/api/calendar-events", ...ListCalendarEventsParams[]];
export declare const getListCalendarEventsQueryOptions: <TData = Awaited<ReturnType<typeof listCalendarEvents>>, TError = ErrorType<unknown>>(params?: ListCalendarEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCalendarEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCalendarEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCalendarEventsQueryResult = NonNullable<Awaited<ReturnType<typeof listCalendarEvents>>>;
export type ListCalendarEventsQueryError = ErrorType<unknown>;
/**
 * @summary List events in a date range
 */
export declare function useListCalendarEvents<TData = Awaited<ReturnType<typeof listCalendarEvents>>, TError = ErrorType<unknown>>(params?: ListCalendarEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCalendarEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCalendarEventUrl: () => string;
/**
 * @summary Add a calendar event
 */
export declare const createCalendarEvent: (calendarEventInput: CalendarEventInput, options?: Parameters<typeof customFetch>[1]) => Promise<CalendarEvent>;
export declare const getCreateCalendarEventMutationKey: () => readonly ["createCalendarEvent"];
export declare const getCreateCalendarEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCalendarEvent>>, TError, CreateCalendarEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCalendarEvent>>, TError, CreateCalendarEventMutationVariables, TContext>;
export type CreateCalendarEventMutationResult = NonNullable<Awaited<ReturnType<typeof createCalendarEvent>>>;
export type CreateCalendarEventMutationBody = BodyType<CalendarEventInput>;
export type CreateCalendarEventMutationError = ErrorType<unknown>;
export type CreateCalendarEventMutationVariables = {
    data: BodyType<CalendarEventInput>;
};
/**
* @summary Add a calendar event
*/
export declare const useCreateCalendarEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCalendarEvent>>, TError, CreateCalendarEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCalendarEvent>>, TError, CreateCalendarEventMutationVariables, TContext>;
export declare const getUpdateCalendarEventUrl: (eventId: string) => string;
/**
 * @summary Update or move a calendar event
 */
export declare const updateCalendarEvent: (eventId: string, calendarEventUpdate: CalendarEventUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<CalendarEvent>;
export declare const getUpdateCalendarEventMutationKey: () => readonly ["updateCalendarEvent"];
export declare const getUpdateCalendarEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCalendarEvent>>, TError, UpdateCalendarEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCalendarEvent>>, TError, UpdateCalendarEventMutationVariables, TContext>;
export type UpdateCalendarEventMutationResult = NonNullable<Awaited<ReturnType<typeof updateCalendarEvent>>>;
export type UpdateCalendarEventMutationBody = BodyType<CalendarEventUpdate>;
export type UpdateCalendarEventMutationError = ErrorType<unknown>;
export type UpdateCalendarEventMutationVariables = {
    eventId: string;
    data: BodyType<CalendarEventUpdate>;
};
/**
* @summary Update or move a calendar event
*/
export declare const useUpdateCalendarEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCalendarEvent>>, TError, UpdateCalendarEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCalendarEvent>>, TError, UpdateCalendarEventMutationVariables, TContext>;
export declare const getDeleteCalendarEventUrl: (eventId: string) => string;
/**
 * @summary Delete an event
 */
export declare const deleteCalendarEvent: (eventId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteCalendarEventMutationKey: () => readonly ["deleteCalendarEvent"];
export declare const getDeleteCalendarEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCalendarEvent>>, TError, DeleteCalendarEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCalendarEvent>>, TError, DeleteCalendarEventMutationVariables, TContext>;
export type DeleteCalendarEventMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCalendarEvent>>>;
export type DeleteCalendarEventMutationError = ErrorType<unknown>;
export type DeleteCalendarEventMutationVariables = {
    eventId: string;
};
/**
* @summary Delete an event
*/
export declare const useDeleteCalendarEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCalendarEvent>>, TError, DeleteCalendarEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCalendarEvent>>, TError, DeleteCalendarEventMutationVariables, TContext>;
export declare const getListSubjectsUrl: () => string;
/**
 * @summary List configurable academic subjects
 */
export declare const listSubjects: (options?: Parameters<typeof customFetch>[1]) => Promise<SubjectList>;
export declare const getListSubjectsQueryKey: () => readonly ["/api/subjects"];
export declare const getListSubjectsQueryOptions: <TData = Awaited<ReturnType<typeof listSubjects>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSubjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSubjects>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSubjectsQueryResult = NonNullable<Awaited<ReturnType<typeof listSubjects>>>;
export type ListSubjectsQueryError = ErrorType<unknown>;
/**
 * @summary List configurable academic subjects
 */
export declare function useListSubjects<TData = Awaited<ReturnType<typeof listSubjects>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSubjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateSubjectUrl: () => string;
/**
 * @summary Add a subject
 */
export declare const createSubject: (subjectInput: SubjectInput, options?: Parameters<typeof customFetch>[1]) => Promise<Subject>;
export declare const getCreateSubjectMutationKey: () => readonly ["createSubject"];
export declare const getCreateSubjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSubject>>, TError, CreateSubjectMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSubject>>, TError, CreateSubjectMutationVariables, TContext>;
export type CreateSubjectMutationResult = NonNullable<Awaited<ReturnType<typeof createSubject>>>;
export type CreateSubjectMutationBody = BodyType<SubjectInput>;
export type CreateSubjectMutationError = ErrorType<unknown>;
export type CreateSubjectMutationVariables = {
    data: BodyType<SubjectInput>;
};
/**
* @summary Add a subject
*/
export declare const useCreateSubject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSubject>>, TError, CreateSubjectMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSubject>>, TError, CreateSubjectMutationVariables, TContext>;
export declare const getUpdateSubjectUrl: (subjectId: string) => string;
/**
 * @summary Update a subject
 */
export declare const updateSubject: (subjectId: string, subjectUpdate: SubjectUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Subject>;
export declare const getUpdateSubjectMutationKey: () => readonly ["updateSubject"];
export declare const getUpdateSubjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSubject>>, TError, UpdateSubjectMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSubject>>, TError, UpdateSubjectMutationVariables, TContext>;
export type UpdateSubjectMutationResult = NonNullable<Awaited<ReturnType<typeof updateSubject>>>;
export type UpdateSubjectMutationBody = BodyType<SubjectUpdate>;
export type UpdateSubjectMutationError = ErrorType<unknown>;
export type UpdateSubjectMutationVariables = {
    subjectId: string;
    data: BodyType<SubjectUpdate>;
};
/**
* @summary Update a subject
*/
export declare const useUpdateSubject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSubject>>, TError, UpdateSubjectMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSubject>>, TError, UpdateSubjectMutationVariables, TContext>;
export declare const getDeleteSubjectUrl: (subjectId: string) => string;
/**
 * @summary Remove a subject
 */
export declare const deleteSubject: (subjectId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteSubjectMutationKey: () => readonly ["deleteSubject"];
export declare const getDeleteSubjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSubject>>, TError, DeleteSubjectMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteSubject>>, TError, DeleteSubjectMutationVariables, TContext>;
export type DeleteSubjectMutationResult = NonNullable<Awaited<ReturnType<typeof deleteSubject>>>;
export type DeleteSubjectMutationError = ErrorType<unknown>;
export type DeleteSubjectMutationVariables = {
    subjectId: string;
};
/**
* @summary Remove a subject
*/
export declare const useDeleteSubject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSubject>>, TError, DeleteSubjectMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteSubject>>, TError, DeleteSubjectMutationVariables, TContext>;
export declare const getListChaptersUrl: (params?: ListChaptersParams) => string;
/**
 * @summary List chapters and syllabus progress
 */
export declare const listChapters: (params?: ListChaptersParams, options?: Parameters<typeof customFetch>[1]) => Promise<ChapterList>;
export declare const getListChaptersQueryKey: (params?: ListChaptersParams) => readonly ["/api/chapters", ...ListChaptersParams[]];
export declare const getListChaptersQueryOptions: <TData = Awaited<ReturnType<typeof listChapters>>, TError = ErrorType<unknown>>(params?: ListChaptersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChapters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listChapters>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListChaptersQueryResult = NonNullable<Awaited<ReturnType<typeof listChapters>>>;
export type ListChaptersQueryError = ErrorType<unknown>;
/**
 * @summary List chapters and syllabus progress
 */
export declare function useListChapters<TData = Awaited<ReturnType<typeof listChapters>>, TError = ErrorType<unknown>>(params?: ListChaptersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChapters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateChapterUrl: () => string;
/**
 * @summary Add an editable chapter or topic
 */
export declare const createChapter: (chapterInput: ChapterInput, options?: Parameters<typeof customFetch>[1]) => Promise<Chapter>;
export declare const getCreateChapterMutationKey: () => readonly ["createChapter"];
export declare const getCreateChapterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChapter>>, TError, CreateChapterMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createChapter>>, TError, CreateChapterMutationVariables, TContext>;
export type CreateChapterMutationResult = NonNullable<Awaited<ReturnType<typeof createChapter>>>;
export type CreateChapterMutationBody = BodyType<ChapterInput>;
export type CreateChapterMutationError = ErrorType<unknown>;
export type CreateChapterMutationVariables = {
    data: BodyType<ChapterInput>;
};
/**
* @summary Add an editable chapter or topic
*/
export declare const useCreateChapter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChapter>>, TError, CreateChapterMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createChapter>>, TError, CreateChapterMutationVariables, TContext>;
export declare const getUpdateChapterUrl: (chapterId: string) => string;
/**
 * @summary Update chapter progress or notes
 */
export declare const updateChapter: (chapterId: string, chapterUpdate: ChapterUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Chapter>;
export declare const getUpdateChapterMutationKey: () => readonly ["updateChapter"];
export declare const getUpdateChapterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateChapter>>, TError, UpdateChapterMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateChapter>>, TError, UpdateChapterMutationVariables, TContext>;
export type UpdateChapterMutationResult = NonNullable<Awaited<ReturnType<typeof updateChapter>>>;
export type UpdateChapterMutationBody = BodyType<ChapterUpdate>;
export type UpdateChapterMutationError = ErrorType<unknown>;
export type UpdateChapterMutationVariables = {
    chapterId: string;
    data: BodyType<ChapterUpdate>;
};
/**
* @summary Update chapter progress or notes
*/
export declare const useUpdateChapter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateChapter>>, TError, UpdateChapterMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateChapter>>, TError, UpdateChapterMutationVariables, TContext>;
export declare const getDeleteChapterUrl: (chapterId: string) => string;
/**
 * @summary Delete a chapter
 */
export declare const deleteChapter: (chapterId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteChapterMutationKey: () => readonly ["deleteChapter"];
export declare const getDeleteChapterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChapter>>, TError, DeleteChapterMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteChapter>>, TError, DeleteChapterMutationVariables, TContext>;
export type DeleteChapterMutationResult = NonNullable<Awaited<ReturnType<typeof deleteChapter>>>;
export type DeleteChapterMutationError = ErrorType<unknown>;
export type DeleteChapterMutationVariables = {
    chapterId: string;
};
/**
* @summary Delete a chapter
*/
export declare const useDeleteChapter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChapter>>, TError, DeleteChapterMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteChapter>>, TError, DeleteChapterMutationVariables, TContext>;
export declare const getListGoalsUrl: () => string;
/**
 * @summary List shared goals and progress
 */
export declare const listGoals: (options?: Parameters<typeof customFetch>[1]) => Promise<GoalList>;
export declare const getListGoalsQueryKey: () => readonly ["/api/goals"];
export declare const getListGoalsQueryOptions: <TData = Awaited<ReturnType<typeof listGoals>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGoals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGoals>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGoalsQueryResult = NonNullable<Awaited<ReturnType<typeof listGoals>>>;
export type ListGoalsQueryError = ErrorType<unknown>;
/**
 * @summary List shared goals and progress
 */
export declare function useListGoals<TData = Awaited<ReturnType<typeof listGoals>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGoals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateGoalUrl: () => string;
/**
 * @summary Create a shared goal
 */
export declare const createGoal: (goalInput: GoalInput, options?: Parameters<typeof customFetch>[1]) => Promise<Goal>;
export declare const getCreateGoalMutationKey: () => readonly ["createGoal"];
export declare const getCreateGoalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGoal>>, TError, CreateGoalMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGoal>>, TError, CreateGoalMutationVariables, TContext>;
export type CreateGoalMutationResult = NonNullable<Awaited<ReturnType<typeof createGoal>>>;
export type CreateGoalMutationBody = BodyType<GoalInput>;
export type CreateGoalMutationError = ErrorType<unknown>;
export type CreateGoalMutationVariables = {
    data: BodyType<GoalInput>;
};
/**
* @summary Create a shared goal
*/
export declare const useCreateGoal: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGoal>>, TError, CreateGoalMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGoal>>, TError, CreateGoalMutationVariables, TContext>;
export declare const getUpdateGoalUrl: (goalId: string) => string;
/**
 * @summary Update goal progress
 */
export declare const updateGoal: (goalId: string, goalUpdate: GoalUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Goal>;
export declare const getUpdateGoalMutationKey: () => readonly ["updateGoal"];
export declare const getUpdateGoalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGoal>>, TError, UpdateGoalMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateGoal>>, TError, UpdateGoalMutationVariables, TContext>;
export type UpdateGoalMutationResult = NonNullable<Awaited<ReturnType<typeof updateGoal>>>;
export type UpdateGoalMutationBody = BodyType<GoalUpdate>;
export type UpdateGoalMutationError = ErrorType<unknown>;
export type UpdateGoalMutationVariables = {
    goalId: string;
    data: BodyType<GoalUpdate>;
};
/**
* @summary Update goal progress
*/
export declare const useUpdateGoal: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGoal>>, TError, UpdateGoalMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateGoal>>, TError, UpdateGoalMutationVariables, TContext>;
export declare const getDeleteGoalUrl: (goalId: string) => string;
/**
 * @summary Delete a goal
 */
export declare const deleteGoal: (goalId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteGoalMutationKey: () => readonly ["deleteGoal"];
export declare const getDeleteGoalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGoal>>, TError, DeleteGoalMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteGoal>>, TError, DeleteGoalMutationVariables, TContext>;
export type DeleteGoalMutationResult = NonNullable<Awaited<ReturnType<typeof deleteGoal>>>;
export type DeleteGoalMutationError = ErrorType<unknown>;
export type DeleteGoalMutationVariables = {
    goalId: string;
};
/**
* @summary Delete a goal
*/
export declare const useDeleteGoal: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGoal>>, TError, DeleteGoalMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteGoal>>, TError, DeleteGoalMutationVariables, TContext>;
export declare const getListHabitsUrl: () => string;
/**
 * @summary List habits and check-in history
 */
export declare const listHabits: (options?: Parameters<typeof customFetch>[1]) => Promise<HabitList>;
export declare const getListHabitsQueryKey: () => readonly ["/api/habits"];
export declare const getListHabitsQueryOptions: <TData = Awaited<ReturnType<typeof listHabits>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHabits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listHabits>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListHabitsQueryResult = NonNullable<Awaited<ReturnType<typeof listHabits>>>;
export type ListHabitsQueryError = ErrorType<unknown>;
/**
 * @summary List habits and check-in history
 */
export declare function useListHabits<TData = Awaited<ReturnType<typeof listHabits>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHabits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateHabitUrl: () => string;
/**
 * @summary Create a habit
 */
export declare const createHabit: (habitInput: HabitInput, options?: Parameters<typeof customFetch>[1]) => Promise<Habit>;
export declare const getCreateHabitMutationKey: () => readonly ["createHabit"];
export declare const getCreateHabitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHabit>>, TError, CreateHabitMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createHabit>>, TError, CreateHabitMutationVariables, TContext>;
export type CreateHabitMutationResult = NonNullable<Awaited<ReturnType<typeof createHabit>>>;
export type CreateHabitMutationBody = BodyType<HabitInput>;
export type CreateHabitMutationError = ErrorType<unknown>;
export type CreateHabitMutationVariables = {
    data: BodyType<HabitInput>;
};
/**
* @summary Create a habit
*/
export declare const useCreateHabit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHabit>>, TError, CreateHabitMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createHabit>>, TError, CreateHabitMutationVariables, TContext>;
export declare const getUpdateHabitUrl: (habitId: string) => string;
/**
 * @summary Update a habit
 */
export declare const updateHabit: (habitId: string, habitUpdate: HabitUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Habit>;
export declare const getUpdateHabitMutationKey: () => readonly ["updateHabit"];
export declare const getUpdateHabitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateHabit>>, TError, UpdateHabitMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateHabit>>, TError, UpdateHabitMutationVariables, TContext>;
export type UpdateHabitMutationResult = NonNullable<Awaited<ReturnType<typeof updateHabit>>>;
export type UpdateHabitMutationBody = BodyType<HabitUpdate>;
export type UpdateHabitMutationError = ErrorType<unknown>;
export type UpdateHabitMutationVariables = {
    habitId: string;
    data: BodyType<HabitUpdate>;
};
/**
* @summary Update a habit
*/
export declare const useUpdateHabit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateHabit>>, TError, UpdateHabitMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateHabit>>, TError, UpdateHabitMutationVariables, TContext>;
export declare const getDeleteHabitUrl: (habitId: string) => string;
/**
 * @summary Delete a habit
 */
export declare const deleteHabit: (habitId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteHabitMutationKey: () => readonly ["deleteHabit"];
export declare const getDeleteHabitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHabit>>, TError, DeleteHabitMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteHabit>>, TError, DeleteHabitMutationVariables, TContext>;
export type DeleteHabitMutationResult = NonNullable<Awaited<ReturnType<typeof deleteHabit>>>;
export type DeleteHabitMutationError = ErrorType<unknown>;
export type DeleteHabitMutationVariables = {
    habitId: string;
};
/**
* @summary Delete a habit
*/
export declare const useDeleteHabit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHabit>>, TError, DeleteHabitMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteHabit>>, TError, DeleteHabitMutationVariables, TContext>;
export declare const getCreateHabitCheckInUrl: (habitId: string) => string;
/**
 * @summary Record today's habit check-in
 */
export declare const createHabitCheckIn: (habitId: string, habitCheckInInput: HabitCheckInInput, options?: Parameters<typeof customFetch>[1]) => Promise<Habit>;
export declare const getCreateHabitCheckInMutationKey: () => readonly ["createHabitCheckIn"];
export declare const getCreateHabitCheckInMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHabitCheckIn>>, TError, CreateHabitCheckInMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createHabitCheckIn>>, TError, CreateHabitCheckInMutationVariables, TContext>;
export type CreateHabitCheckInMutationResult = NonNullable<Awaited<ReturnType<typeof createHabitCheckIn>>>;
export type CreateHabitCheckInMutationBody = BodyType<HabitCheckInInput>;
export type CreateHabitCheckInMutationError = ErrorType<unknown>;
export type CreateHabitCheckInMutationVariables = {
    habitId: string;
    data: BodyType<HabitCheckInInput>;
};
/**
* @summary Record today's habit check-in
*/
export declare const useCreateHabitCheckIn: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHabitCheckIn>>, TError, CreateHabitCheckInMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createHabitCheckIn>>, TError, CreateHabitCheckInMutationVariables, TContext>;
export declare const getListJournalEntriesUrl: () => string;
/**
 * @summary List journal entries shared inside this workspace
 */
export declare const listJournalEntries: (options?: Parameters<typeof customFetch>[1]) => Promise<JournalEntryList>;
export declare const getListJournalEntriesQueryKey: () => readonly ["/api/journal-entries"];
export declare const getListJournalEntriesQueryOptions: <TData = Awaited<ReturnType<typeof listJournalEntries>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJournalEntries>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listJournalEntries>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListJournalEntriesQueryResult = NonNullable<Awaited<ReturnType<typeof listJournalEntries>>>;
export type ListJournalEntriesQueryError = ErrorType<unknown>;
/**
 * @summary List journal entries shared inside this workspace
 */
export declare function useListJournalEntries<TData = Awaited<ReturnType<typeof listJournalEntries>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJournalEntries>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateJournalEntryUrl: () => string;
/**
 * @summary Write a workspace-visible journal entry
 */
export declare const createJournalEntry: (journalEntryInput: JournalEntryInput, options?: Parameters<typeof customFetch>[1]) => Promise<JournalEntry>;
export declare const getCreateJournalEntryMutationKey: () => readonly ["createJournalEntry"];
export declare const getCreateJournalEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJournalEntry>>, TError, CreateJournalEntryMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createJournalEntry>>, TError, CreateJournalEntryMutationVariables, TContext>;
export type CreateJournalEntryMutationResult = NonNullable<Awaited<ReturnType<typeof createJournalEntry>>>;
export type CreateJournalEntryMutationBody = BodyType<JournalEntryInput>;
export type CreateJournalEntryMutationError = ErrorType<unknown>;
export type CreateJournalEntryMutationVariables = {
    data: BodyType<JournalEntryInput>;
};
/**
* @summary Write a workspace-visible journal entry
*/
export declare const useCreateJournalEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJournalEntry>>, TError, CreateJournalEntryMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createJournalEntry>>, TError, CreateJournalEntryMutationVariables, TContext>;
export declare const getUpdateJournalEntryUrl: (entryId: string) => string;
/**
 * @summary Update a journal entry
 */
export declare const updateJournalEntry: (entryId: string, journalEntryUpdate: JournalEntryUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<JournalEntry>;
export declare const getUpdateJournalEntryMutationKey: () => readonly ["updateJournalEntry"];
export declare const getUpdateJournalEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateJournalEntry>>, TError, UpdateJournalEntryMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateJournalEntry>>, TError, UpdateJournalEntryMutationVariables, TContext>;
export type UpdateJournalEntryMutationResult = NonNullable<Awaited<ReturnType<typeof updateJournalEntry>>>;
export type UpdateJournalEntryMutationBody = BodyType<JournalEntryUpdate>;
export type UpdateJournalEntryMutationError = ErrorType<unknown>;
export type UpdateJournalEntryMutationVariables = {
    entryId: string;
    data: BodyType<JournalEntryUpdate>;
};
/**
* @summary Update a journal entry
*/
export declare const useUpdateJournalEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateJournalEntry>>, TError, UpdateJournalEntryMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateJournalEntry>>, TError, UpdateJournalEntryMutationVariables, TContext>;
export declare const getDeleteJournalEntryUrl: (entryId: string) => string;
/**
 * @summary Delete a journal entry
 */
export declare const deleteJournalEntry: (entryId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteJournalEntryMutationKey: () => readonly ["deleteJournalEntry"];
export declare const getDeleteJournalEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteJournalEntry>>, TError, DeleteJournalEntryMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteJournalEntry>>, TError, DeleteJournalEntryMutationVariables, TContext>;
export type DeleteJournalEntryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteJournalEntry>>>;
export type DeleteJournalEntryMutationError = ErrorType<unknown>;
export type DeleteJournalEntryMutationVariables = {
    entryId: string;
};
/**
* @summary Delete a journal entry
*/
export declare const useDeleteJournalEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteJournalEntry>>, TError, DeleteJournalEntryMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteJournalEntry>>, TError, DeleteJournalEntryMutationVariables, TContext>;
export declare const getListFocusSessionsUrl: (params?: ListFocusSessionsParams) => string;
/**
 * @summary List persisted focus sessions and totals
 */
export declare const listFocusSessions: (params?: ListFocusSessionsParams, options?: Parameters<typeof customFetch>[1]) => Promise<FocusSessionList>;
export declare const getListFocusSessionsQueryKey: (params?: ListFocusSessionsParams) => readonly ["/api/focus-sessions", ...ListFocusSessionsParams[]];
export declare const getListFocusSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listFocusSessions>>, TError = ErrorType<unknown>>(params?: ListFocusSessionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFocusSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFocusSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFocusSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listFocusSessions>>>;
export type ListFocusSessionsQueryError = ErrorType<unknown>;
/**
 * @summary List persisted focus sessions and totals
 */
export declare function useListFocusSessions<TData = Awaited<ReturnType<typeof listFocusSessions>>, TError = ErrorType<unknown>>(params?: ListFocusSessionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFocusSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateFocusSessionUrl: () => string;
/**
 * @summary Start or record a focus session
 */
export declare const createFocusSession: (focusSessionInput: FocusSessionInput, options?: Parameters<typeof customFetch>[1]) => Promise<FocusSession>;
export declare const getCreateFocusSessionMutationKey: () => readonly ["createFocusSession"];
export declare const getCreateFocusSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFocusSession>>, TError, CreateFocusSessionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFocusSession>>, TError, CreateFocusSessionMutationVariables, TContext>;
export type CreateFocusSessionMutationResult = NonNullable<Awaited<ReturnType<typeof createFocusSession>>>;
export type CreateFocusSessionMutationBody = BodyType<FocusSessionInput>;
export type CreateFocusSessionMutationError = ErrorType<unknown>;
export type CreateFocusSessionMutationVariables = {
    data: BodyType<FocusSessionInput>;
};
/**
* @summary Start or record a focus session
*/
export declare const useCreateFocusSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFocusSession>>, TError, CreateFocusSessionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFocusSession>>, TError, CreateFocusSessionMutationVariables, TContext>;
export declare const getUpdateFocusSessionUrl: (sessionId: string) => string;
/**
 * @summary Pause, resume, complete, or stop a focus session
 */
export declare const updateFocusSession: (sessionId: string, focusSessionUpdate: FocusSessionUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<FocusSession>;
export declare const getUpdateFocusSessionMutationKey: () => readonly ["updateFocusSession"];
export declare const getUpdateFocusSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFocusSession>>, TError, UpdateFocusSessionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateFocusSession>>, TError, UpdateFocusSessionMutationVariables, TContext>;
export type UpdateFocusSessionMutationResult = NonNullable<Awaited<ReturnType<typeof updateFocusSession>>>;
export type UpdateFocusSessionMutationBody = BodyType<FocusSessionUpdate>;
export type UpdateFocusSessionMutationError = ErrorType<unknown>;
export type UpdateFocusSessionMutationVariables = {
    sessionId: string;
    data: BodyType<FocusSessionUpdate>;
};
/**
* @summary Pause, resume, complete, or stop a focus session
*/
export declare const useUpdateFocusSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFocusSession>>, TError, UpdateFocusSessionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateFocusSession>>, TError, UpdateFocusSessionMutationVariables, TContext>;
export declare const getListNotificationsUrl: (params?: ListNotificationsParams) => string;
/**
 * @summary List current in-app notifications
 */
export declare const listNotifications: (params?: ListNotificationsParams, options?: Parameters<typeof customFetch>[1]) => Promise<NotificationList>;
export declare const getListNotificationsQueryKey: (params?: ListNotificationsParams) => readonly ["/api/notifications", ...ListNotificationsParams[]];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params?: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List current in-app notifications
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params?: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkNotificationReadUrl: (notificationId: string) => string;
/**
 * @summary Mark an in-app notification as read
 */
export declare const markNotificationRead: (notificationId: string, options?: Parameters<typeof customFetch>[1]) => Promise<Notification>;
export declare const getMarkNotificationReadMutationKey: () => readonly ["markNotificationRead"];
export declare const getMarkNotificationReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, MarkNotificationReadMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, MarkNotificationReadMutationVariables, TContext>;
export type MarkNotificationReadMutationResult = NonNullable<Awaited<ReturnType<typeof markNotificationRead>>>;
export type MarkNotificationReadMutationError = ErrorType<unknown>;
export type MarkNotificationReadMutationVariables = {
    notificationId: string;
};
/**
* @summary Mark an in-app notification as read
*/
export declare const useMarkNotificationRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, MarkNotificationReadMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markNotificationRead>>, TError, MarkNotificationReadMutationVariables, TContext>;
export declare const getListActivityUrl: () => string;
/**
 * @summary Read recent shared workspace activity
 */
export declare const listActivity: (options?: Parameters<typeof customFetch>[1]) => Promise<ActivityList>;
export declare const getListActivityQueryKey: () => readonly ["/api/activity"];
export declare const getListActivityQueryOptions: <TData = Awaited<ReturnType<typeof listActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListActivityQueryResult = NonNullable<Awaited<ReturnType<typeof listActivity>>>;
export type ListActivityQueryError = ErrorType<unknown>;
/**
 * @summary Read recent shared workspace activity
 */
export declare function useListActivity<TData = Awaited<ReturnType<typeof listActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map