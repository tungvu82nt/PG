import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { Announcement } from './entities/announcement.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { CreateBannerDto, UpdateBannerDto } from './dto/create-banner.dto';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto
} from './dto/create-announcement.dto'; // merged imports for cleaner file

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepo: Repository<Banner>,
    @InjectRepository(Announcement)
    private announcementRepo: Repository<Announcement>,
    @InjectRepository(SystemSetting)
    private settingsRepo: Repository<SystemSetting>,
  ) {}

  // --- BANNERS ---
  async findAllBanners(admin = false) {
    const qb = this.bannerRepo
      .createQueryBuilder('banner')
      .orderBy('banner.sequence', 'ASC');
    if (!admin) {
      qb.where('banner.active = :active', { active: true });
    }
    return qb.getMany();
  }

  async createBanner(dto: CreateBannerDto) {
    const banner = this.bannerRepo.create(dto);
    return this.bannerRepo.save(banner);
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, dto);
    return this.bannerRepo.save(banner);
  }

  async deleteBanner(id: string) {
    const result = await this.bannerRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Banner not found');
    return { success: true };
  }

  // --- ANNOUNCEMENTS ---
  async findAllAnnouncements(admin = false) {
    const qb = this.announcementRepo.createQueryBuilder('ann')
      .orderBy('ann.createdAt', 'DESC');
    
    if (!admin) {
      qb.where('ann.active = :active', { active: true });
      // Optional: filter by date range
      const now = new Date();
      qb.andWhere('(ann.startTime IS NULL OR ann.startTime <= :now)', { now });
      qb.andWhere('(ann.endTime IS NULL OR ann.endTime >= :now)', { now });
    }
    
    return qb.getMany();
  }

  async createAnnouncement(dto: CreateAnnouncementDto) {
    const ann = this.announcementRepo.create(dto);
    return this.announcementRepo.save(ann);
  }

  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto) {
    const ann = await this.announcementRepo.findOne({ where: { id } });
    if (!ann) throw new NotFoundException('Announcement not found');
    Object.assign(ann, dto);
    return this.announcementRepo.save(ann);
  }

  async deleteAnnouncement(id: string) {
    const result = await this.announcementRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Announcement not found');
    return { success: true };
  }

  // --- SYSTEM SETTINGS ---
  async getSettings() {
    return this.settingsRepo.find();
  }

  async updateSetting(key: string, value: any) {
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingsRepo.create({ key, value });
    } else {
      setting.value = value;
    }
    return this.settingsRepo.save(setting);
  }
}
