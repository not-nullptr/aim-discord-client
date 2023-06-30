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

export interface User {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: number;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
}

export interface Sticker {
    id: string;
    pack_id?: string;
    name: string;
    description: string;
    tags: string;
    asset?: string;
    type: number;
    format_type: number;
    available?: boolean;
    guild_id?: string;
    user?: User;
    sort_value?: number;
}

export interface Emoji {
    id: string;
    name: string;
    roles?: string[];
    user?: User;
    require_colons: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
}

export interface UnavailableGuild {
    id: string;
    name: string;
    icon?: string;
    splash?: string;
    discovery_splash?: string;
    emojis: Emoji[];
    features: string[];
    approximate_member_count: number;
    approximate_presence_count: number;
    description?: string;
    stickers: Sticker[];
}

export interface Channel {
    id: string;
    type: number;
    guild_id?: string;
    position?: number;
    permission_overwrites?: any[];
    name?: string;
    topic?: string;
    nsfw?: boolean;
    last_message_id?: string;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: User[];
    icon?: string;
    managed?: boolean;
    application_id?: string;
    owner_id?: string;
    owner?: Member;
    parent_id?: string;
    last_pin_timestamp?: Date;
    rtc_region?: string;
    video_quality_mode?: number;
    total_message_sent?: number;
    message_count?: number;
    flags: number;
}

export interface ReadyPacket {
    v: number;
    user: User;
    users: User[];
    guilds: UnavailableGuild[];
    session_id: string;
    resume_gateway_url: string;
    shard?: [number, number];
    private_channels: Channel[];
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
