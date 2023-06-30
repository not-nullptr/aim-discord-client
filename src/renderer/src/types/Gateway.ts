export interface IdentifyPacket {
    token: string;
    capabilities: number;
    properties: {
        os: string;
        browser: string;
        device: string;
        system_locale: string;
        browser_user_agent: string;
        browser_version: string;
        os_version: string;
        referrer: string;
        referring_domain: string;
        referrer_current: string;
        referring_domain_current: string;
        release_channel: string;
        client_build_number: number;
        client_event_source: string | null;
    };
    presence: {
        status: string;
        since: number;
        activities: any[];
        afk: boolean;
    };
    compress: boolean;
    client_state: {
        guild_versions: {};
        highest_last_message_id: string;
        read_state_version: number;
        user_guild_settings_version: number;
        user_settings_version: number;
        private_channels_version: string;
        api_code_version: number;
    };
}

export interface ReadyPacket {
    v: number;
    users: UserElement[];
    user_settings_proto: string;
    user_guild_settings: UserGuildSettings;
    user: User;
    tutorial: null;
    sessions: Session[];
    session_type: string;
    session_id: string;
    resume_gateway_url: string;
    relationships: Relationship[];
    read_state: ReadState;
    private_channels: PrivateChannel[];
    merged_members: Array<MergedMember[]>;
    guilds: Guild[];
    guild_join_requests: any[];
    guild_experiments: Array<
        Array<
            | Array<
                  | Array<
                        Array<
                            Array<
                                | Array<
                                      | Array<
                                            | Array<
                                                  | string[]
                                                  | number
                                                  | null
                                                  | string
                                              >
                                            | boolean
                                            | PurpleGuildExperiment
                                            | number
                                            | null
                                        >
                                      | PurpleGuildExperiment
                                      | number
                                  >
                                | number
                            >
                        >
                    >
                  | FluffyGuildExperiment
              >
            | number
            | null
            | string
        >
    >;
    geo_ordered_rtc_regions: string[];
    friend_suggestion_count: number;
    experiments: Array<number[]>;
    country_code: string;
    consents: Consents;
    connected_accounts: ConnectedAccount[];
    auth_session_id_hash: string;
    api_code_version: number;
    analytics_token: string;
    _trace: string[];
}

export interface ConnectedAccount {
    visibility: number;
    verified: boolean;
    type: string;
    two_way_link: boolean;
    show_activity: boolean;
    revoked: boolean;
    name: string;
    metadata_visibility: number;
    id: string;
    friend_sync: boolean;
    access_token?: string;
}

export interface Consents {
    personalization: Personalization;
}

export interface Personalization {
    consented: boolean;
}

export interface PurpleGuildExperiment {
    s: number;
    e: number;
}

export interface FluffyGuildExperiment {
    k: string[];
    b: number;
}

export interface Guild {
    version: number;
    threads: Thread[];
    stickers: Sticker[];
    stage_instances: any[];
    roles: Role[];
    properties: Properties;
    premium_subscription_count: number;
    member_count: number;
    lazy: boolean;
    large: boolean;
    joined_at: Date;
    id: string;
    guild_scheduled_events: GuildScheduledEvent[];
    emojis: Emoji[];
    data_mode: DataMode;
    channels: Channel[];
    application_command_counts: { [key: string]: number };
}

export interface Channel {
    type: number;
    topic?: null | string;
    theme_color?: number | null;
    rate_limit_per_user?: number;
    position: number;
    permission_overwrites: PermissionOverwrite[];
    parent_id?: null | string;
    nsfw?: boolean;
    name: string;
    last_message_id?: null | string;
    id: string;
    icon_emoji?: IconEmoji | null;
    flags: number;
    last_pin_timestamp?: Date | null;
    user_limit?: number;
    rtc_region?: null | string;
    bitrate?: number;
    template?: string;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: number | null;
    default_reaction_emoji?: DefaultReactionEmoji | null;
    default_forum_layout?: number;
    available_tags?: AvailableTag[];
    default_auto_archive_duration?: number;
    video_quality_mode?: number;
}

export interface AvailableTag {
    name: string;
    moderated: boolean;
    id: string;
    emoji_name: null | string;
    emoji_id: null | string;
}

export interface DefaultReactionEmoji {
    emoji_name: null | string;
    emoji_id: null | string;
}

export interface IconEmoji {
    name: string;
    id: null | string;
}

export interface PermissionOverwrite {
    type: number;
    id: string;
    deny: string;
    allow: string;
}

export type DataMode = "full";

export interface Emoji {
    roles: string[];
    require_colons: boolean;
    name: string;
    managed: boolean;
    id: string;
    available: boolean;
    animated: boolean;
}

export interface GuildScheduledEvent {
    status: number;
    sku_ids: any[];
    scheduled_start_time: Date;
    scheduled_end_time: Date | null;
    privacy_level: number;
    name: string;
    image: null | string;
    id: string;
    guild_id: string;
    entity_type: number;
    entity_metadata: EntityMetadata | null;
    entity_id: null;
    description: null | string;
    creator_id?: string;
    channel_id: null | string;
}

export interface EntityMetadata {
    location: string;
}

export interface Properties {
    home_header: null | string;
    max_stage_video_channel_users: number;
    afk_timeout: number;
    mfa_level: number;
    public_updates_channel_id: null | string;
    icon: null | string;
    default_message_notifications: number;
    premium_progress_bar_enabled: boolean;
    description: null | string;
    preferred_locale: PreferredLocale;
    max_members: number;
    vanity_url_code: null | string;
    afk_channel_id: null | string;
    id: string;
    premium_tier: number;
    banner: null | string;
    latest_onboarding_question_id: null | string;
    owner_id: string;
    safety_alerts_channel_id: null | string;
    system_channel_id: null | string;
    features: string[];
    incidents_data: null;
    system_channel_flags: number;
    verification_level: number;
    hub_type: null;
    explicit_content_filter: number;
    splash: null | string;
    nsfw_level: number;
    application_id: null;
    max_video_channel_users: number;
    discovery_splash: null | string;
    nsfw: boolean;
    name: string;
    rules_channel_id: null | string;
}

export type PreferredLocale = "en-US";

export interface Role {
    unicode_emoji: null | string;
    tags: Tags;
    position: number;
    permissions: string;
    name: string;
    mentionable: boolean;
    managed: boolean;
    id: string;
    icon: null | string;
    hoist: boolean;
    flags: number;
    color: number;
}

export interface Tags {
    premium_subscriber?: null;
    bot_id?: string;
    guild_connections?: null;
}

export interface Sticker {
    type: number;
    tags: string;
    name: string;
    id: string;
    guild_id: string;
    format_type: number;
    description: null | string;
    available: boolean;
    asset: string;
}

export interface Thread {
    type: number;
    total_message_sent: number;
    thread_metadata: ThreadMetadata;
    rate_limit_per_user: number;
    parent_id: string;
    owner_id: string;
    name: string;
    message_count: number;
    member_ids_preview: string[];
    member_count: number;
    member: Member;
    last_message_id: string;
    id: string;
    guild_id: string;
    flags: number;
    applied_tags?: string[];
}

export interface Member {
    muted: boolean;
    mute_config: null;
    join_timestamp: Date;
    flags: number;
}

export interface ThreadMetadata {
    locked: boolean;
    create_timestamp: Date;
    auto_archive_duration: number;
    archived: boolean;
    archive_timestamp: Date;
    invitable?: boolean;
}

export interface MergedMember {
    user_id: string;
    roles: string[];
    premium_since: null;
    pending: boolean;
    nick: null | string;
    mute: boolean;
    joined_at: Date;
    flags: number;
    deaf: boolean;
    communication_disabled_until: null;
    avatar: null;
}

export interface PrivateChannel {
    type: number;
    recipient_ids: string[];
    last_pin_timestamp?: Date;
    last_message_id: null | string;
    is_spam?: boolean;
    id: string;
    flags: number;
    is_message_request_timestamp?: Date | null;
    is_message_request?: boolean;
    owner_id?: string;
    name?: null | string;
    icon?: null | string;
}

export interface ReadState {
    version: number;
    partial: boolean;
    entries: ReadStateEntry[];
}

export interface ReadStateEntry {
    mention_count?: number;
    last_viewed?: number;
    last_pin_timestamp?: Date;
    last_message_id?: string;
    id: string;
    flags?: number;
    read_state_type?: number;
    last_acked_id?: string;
    badge_count?: number;
}

export interface Relationship {
    user_id: string;
    type: number;
    since?: Date;
    nickname: null;
    id: string;
}

export interface Session {
    status: string;
    session_id: string;
    client_info: ClientInfo;
    activities: any[];
}

export interface ClientInfo {
    version: number;
    os: string;
    client: string;
}

export interface User {
    verified: boolean;
    username: string;
    purchased_flags: number;
    pronouns: string;
    premium_type: number;
    premium: boolean;
    phone: string;
    nsfw_allowed: boolean;
    mobile: boolean;
    mfa_enabled: boolean;
    id: string;
    global_name: string;
    flags: number;
    email: string;
    discriminator: string;
    desktop: boolean;
    bio: string;
    banner_color: string;
    banner: null;
    avatar_decoration: null;
    avatar: string;
    accent_color: number;
}

export interface UserGuildSettings {
    version: number;
    partial: boolean;
    entries: UserGuildSettingsEntry[];
}

export interface UserGuildSettingsEntry {
    version: number;
    suppress_roles: boolean;
    suppress_everyone: boolean;
    notify_highlights: number;
    muted: boolean;
    mute_scheduled_events: boolean;
    mute_config: null;
    mobile_push: boolean;
    message_notifications: number;
    hide_muted_channels: boolean;
    guild_id: null | string;
    flags: number;
    channel_overrides: ChannelOverride[];
}

export interface ChannelOverride {
    muted: boolean;
    mute_config: null;
    message_notifications: number;
    collapsed: boolean;
    channel_id: string;
    flags?: number;
}

export interface UserElement {
    username: string;
    public_flags: number;
    id: string;
    global_name: null | string;
    display_name?: null | string;
    discriminator: string;
    bot?: boolean;
    avatar_decoration: null;
    avatar: null | string;
    system?: boolean;
}

export type DispatchType =
    | "HELLO"
    | "HEARTBEAT_ACK"
    | "RECONNECT"
    | "INVALID_SESSION"
    | "READY"
    | "READY_SUPPLEMENTAL"
    | "RESUMED"
    | "AUTH_SESSION_CHANGE"
    | "APPLICATION_COMMAND_PERMISSIONS_UPDATE"
    | "CALL_CREATE"
    | "CALL_UPDATE"
    | "CALL_DELETE"
    | "CHANNEL_CREATE"
    | "CHANNEL_UPDATE"
    | "CHANNEL_DELETE"
    | "CHANNEL_PINS_UPDATE"
    | "CHANNEL_RECIPIENT_ADD"
    | "CHANNEL_RECIPIENT_REMOVE"
    | "THREAD_CREATE"
    | "THREAD_UPDATE"
    | "THREAD_DELETE"
    | "THREAD_LIST_SYNC"
    | "THREAD_MEMBER_UPDATE"
    | "THREAD_MEMBERS_UPDATE"
    | "GUILD_CREATE"
    | "GUILD_UPDATE"
    | "GUILD_DELETE"
    | "GUILD_AUDIT_LOG_ENTRY_CREATE"
    | "GUILD_BAN_ADD"
    | "GUILD_BAN_REMOVE"
    | "GUILD_EMOJIS_UPDATE"
    | "GUILD_STICKERS_UPDATE"
    | "GUILD_MEMBER_ADD"
    | "GUILD_MEMBER_REMOVE"
    | "GUILD_MEMBER_UPDATE"
    | "GUILD_MEMBERS_CHUNK"
    | "GUILD_ROLE_CREATE"
    | "GUILD_ROLE_UPDATE"
    | "GUILD_ROLE_DELETE"
    | "GUILD_SCHEDULED_EVENT_CREATE"
    | "GUILD_SCHEDULED_EVENT_UPDATE"
    | "GUILD_SCHEDULED_EVENT_DELETE"
    | "GUILD_SCHEDULED_EVENT_USER_ADD"
    | "GUILD_SCHEDULED_EVENT_USER_REMOVE"
    | "GUILD_INTEGRATIONS_UPDATE"
    | "INTEGRATION_CREATE"
    | "INTEGRATION_UPDATE"
    | "INTEGRATION_DELETE"
    | "INTERACTION_CREATE"
    | "INVITE_CREATE"
    | "INVITE_DELETE"
    | "MESSAGE_CREATE"
    | "MESSAGE_UPDATE"
    | "MESSAGE_DELETE"
    | "MESSAGE_DELETE_BULK"
    | "MESSAGE_REACTION_ADD"
    | "MESSAGE_REACTION_REMOVE"
    | "MESSAGE_REACTION_REMOVE_ALL"
    | "MESSAGE_REACTION_REMOVE_EMOJI"
    | "RECENT_MENTION_DELETE"
    | "PRESENCE_UPDATE"
    | "RELATIONSHIP_ADD"
    | "RELATIONSHIP_UPDATE"
    | "RELATIONSHIP_REMOVE"
    | "STAGE_INSTANCE_CREATE"
    | "STAGE_INSTANCE_UPDATE"
    | "STAGE_INSTANCE_DELETE"
    | "TYPING_START"
    | "USER_UPDATE"
    | "USER_NOTE_UPDATE"
    | "USER_REQUIRED_ACTION_UPDATE"
    | "VOICE_STATE_UPDATE"
    | "VOICE_SERVER_UPDATE"
    | "WEBHOOKS_UPDATE"
    | "SPEED_TEST_CREATE"
    | "SPEED_TEST_DELETE"
    | "SPEED_TEST_SERVER_UPDATE"
    | "EMBEDDED_ACTIVITY_UPDATE"
    | "VOICE_CHANNEL_EFFECT_SEND";

export interface MessageCreatePacket {
    type: number;
    tts: boolean;
    timestamp: Date;
    referenced_message: ReferencedMessage | null;
    pinned: boolean;
    nonce: string;
    mentions: Author[];
    mention_roles: any[];
    mention_everyone: boolean;
    member: Member;
    id: string;
    flags: number;
    embeds: any[];
    edited_timestamp: null;
    content: string;
    components: any[];
    channel_id: string;
    author: Author;
    attachments: Attachment[];
    guild_id: string;
    message_reference?: MessageReference;
}

export interface Attachment {
    width: number;
    url: string;
    size: number;
    proxy_url: string;
    id: string;
    height: number;
    filename: string;
    content_type: string;
}

export interface Author {
    username: string;
    public_flags: number;
    id: string;
    global_name: string;
    discriminator: string;
    avatar_decoration: null;
    avatar: string;
    member?: Member;
}

export interface Member {
    roles: string[];
    premium_since: null;
    pending: boolean;
    nick: null | string;
    mute: boolean;
    joined_at: Date;
    flags: number;
    deaf: boolean;
    communication_disabled_until: null;
    avatar: null;
}

export interface MessageReference {
    message_id: string;
    guild_id: string;
    channel_id: string;
}

export interface ReferencedMessage {
    type: number;
    tts: boolean;
    timestamp: Date;
    pinned: boolean;
    message_reference: MessageReference;
    mentions: Author[];
    mention_roles: any[];
    mention_everyone: boolean;
    id: string;
    flags: number;
    embeds: any[];
    edited_timestamp: null;
    content: string;
    components: any[];
    channel_id: string;
    author: Author;
    attachments: Attachment[];
}
