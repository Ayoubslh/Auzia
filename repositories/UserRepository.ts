import { supabase } from '../supabase/client';
import type { User, DiasporaFilter } from '../types';

function toUser(row: any): User {
  return {
    id:                        row.id,
    nickname:                  row.nickname ?? '',
    firstName:                 row.first_name ?? '',
    lastName:                  row.last_name ?? '',
    email:                     row.email ?? '',
    avatar:                    row.avatar_url ?? undefined,
    avatarInitials:            row.avatar_initials ?? '',
    avatarColor:               row.avatar_color ?? '#2E7D32',
    countryOfOrigin:           row.country_of_origin ?? '',
    countryOfOriginFlag:       row.country_of_origin_flag ?? '',
    countryOfResidence:        row.country_of_residence ?? '',
    countryOfResidenceFlag:    row.country_of_residence_flag ?? '',
    cityOfResidence:           row.city_of_residence ?? '',
    workField:                 row.work_field ?? '',
    status:                    row.status ?? undefined,
    phoneNumber:               row.phone_number ?? undefined,
    linkedin:                  row.linkedin ?? undefined,
    instagram:                 row.instagram ?? undefined,
    aboutMe:                   row.about_me ?? undefined,
    connectionCount:           row.connection_count ?? 0,
    countriesCount:            row.countries_count ?? 0,
    memberSince:               row.created_at?.slice(0, 7) ?? '',
    latitude:                  row.latitude ?? 0,
    longitude:                 row.longitude ?? 0,
    isLookingForOpportunities: row.is_looking_for_opportunities ?? false,
    commonConnections:         row.common_connections ?? 0,
    showOnMap:                 row.show_on_map ?? true,
    allowChat:                 row.allow_chat ?? true,
    nameDisplayMode:           row.name_display_mode ?? 'nickname',
    pushToken:                 row.push_token ?? undefined,
  };
}

export interface IUserRepository {
  getCurrentUser(): Promise<User>;
  getUsers(filter?: DiasporaFilter): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  updateCurrentUser(data: Partial<User>): Promise<User>;
}

class UserRepository implements IUserRepository {
  async getCurrentUser(): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return toUser(data);
  }

  async getUsers(filter?: DiasporaFilter): Promise<User[]> {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('has_completed_onboarding', true);

    if (filter?.country) query = query.eq('country_of_residence', filter.country);
    if (filter?.city)    query = query.ilike('city_of_residence', `%${filter.city}%`);
    if (filter?.domain)  query = query.ilike('work_field', `%${filter.domain}%`);
    if (filter?.status)  query = query.ilike('status', `%${filter.status}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toUser);
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return toUser(data);
  }

  async updateCurrentUser(updates: Partial<User>): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id:                        user.id,
        nickname:                  updates.nickname,
        first_name:                updates.firstName,
        last_name:                 updates.lastName,
        avatar_url:                updates.avatar,
        avatar_initials:           updates.avatarInitials,
        avatar_color:              updates.avatarColor,
        country_of_origin:         updates.countryOfOrigin,
        country_of_origin_flag:    updates.countryOfOriginFlag,
        country_of_residence:      updates.countryOfResidence,
        country_of_residence_flag: updates.countryOfResidenceFlag,
        city_of_residence:         updates.cityOfResidence,
        work_field:                updates.workField,
        status:                    updates.status,
        phone_number:              updates.phoneNumber,
        linkedin:                  updates.linkedin,
        instagram:                 updates.instagram,
        about_me:                  updates.aboutMe,
        latitude:                  updates.latitude,
        longitude:                 updates.longitude,
        show_on_map:               updates.showOnMap,
        allow_chat:                updates.allowChat,
        name_display_mode:         updates.nameDisplayMode,
        push_token:                updates.pushToken,
        has_completed_onboarding:  true,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return toUser(data);
  }
}

export const userRepository = new UserRepository();
